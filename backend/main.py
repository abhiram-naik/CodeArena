from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from pydantic import BaseModel

from database import engine, Base, SessionLocal
import models

from schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse,
    TestCaseUpdate,
    SubmissionCreate,
    SubmissionResponse
)

from executor import execute_code

from leaderboard import router as leaderboard_router

import hashlib
import secrets
import hmac
import os
from dotenv import load_dotenv
import json
import time
import base64
import smtplib

from email.message import EmailMessage
from datetime import datetime, timedelta


# Load variables from backend/.env before reading os.environ.
load_dotenv()


# =========================================================
# DATABASE
# =========================================================

class EmailChangeToken(Base):
    __tablename__ = "email_change_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    new_email = Column(String, nullable=False)
    token_hash = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)


Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI()

# Swagger/OpenAPI Bearer authentication.
# This creates the Authorize button in /docs and automatically
# sends the JWT as: Authorization: Bearer <token>
bearer_scheme = HTTPBearer(auto_error=False)


# =========================================================
# LEADERBOARD
# =========================================================

app.include_router(leaderboard_router)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str) -> str:

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(
    password: str,
    stored_password: str
) -> bool:

    try:

        salt, stored_hash = stored_password.split("$")

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        ).hex()

        return hmac.compare_digest(
            password_hash,
            stored_hash
        )

    except (ValueError, AttributeError):

        return False


# =========================================================
# TOKEN CONFIGURATION
# =========================================================

SECRET_KEY = os.environ.get("CODEARENA_SECRET")

if not SECRET_KEY:

    raise RuntimeError(
        "CODEARENA_SECRET is not configured"
    )


TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60


# =========================================================
# PASSWORD RESET EMAIL CONFIGURATION
# =========================================================
#
# Configure these environment variables before using the
# real email reset flow:
#
# SMTP_HOST
# SMTP_PORT
# SMTP_USER
# SMTP_PASSWORD
# SMTP_FROM_EMAIL
# CODEARENA_FRONTEND_URL
#
# Example for Gmail:
#
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=yourgmail@gmail.com
# SMTP_PASSWORD=your-16-character-app-password
# SMTP_FROM_EMAIL=yourgmail@gmail.com
# CODEARENA_FRONTEND_URL=http://localhost:5173
#
# IMPORTANT:
# Use a Gmail App Password, NOT your normal Gmail password.
#
# =========================================================

SMTP_HOST = os.environ.get(
    "SMTP_HOST",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.environ.get(
        "SMTP_PORT",
        "587"
    )
)

SMTP_USER = os.environ.get(
    "SMTP_USER",
    ""
)

SMTP_PASSWORD = os.environ.get(
    "SMTP_PASSWORD",
    ""
)

SMTP_FROM_EMAIL = os.environ.get(
    "SMTP_FROM_EMAIL",
    SMTP_USER
)

FRONTEND_URL = os.environ.get(
    "CODEARENA_FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


# =========================================================
# SEND PASSWORD RESET EMAIL
# =========================================================

def send_password_reset_email(
    recipient_email: str,
    reset_token: str
) -> None:

    if not SMTP_USER or not SMTP_PASSWORD:

        raise RuntimeError(
            "SMTP email configuration is missing. "
            "Configure SMTP_USER and SMTP_PASSWORD."
        )

    reset_link = (
        f"{FRONTEND_URL}/reset-password"
        f"?token={reset_token}"
    )

    message = EmailMessage()

    message["Subject"] = (
        "CodeArena Password Reset"
    )

    message["From"] = SMTP_FROM_EMAIL

    message["To"] = recipient_email

    message.set_content(
        f"""Hello,

We received a request to reset your CodeArena password.

Use the following link to choose a new password:

{reset_link}

This password reset link expires in 15 minutes
and can only be used once.

If you did not request a password reset,
you can safely ignore this email.

CodeArena
"""
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT,
        timeout=15
    ) as server:

        server.ehlo()

        server.starttls()

        server.ehlo()

        server.login(
            SMTP_USER,
            SMTP_PASSWORD
        )

        server.send_message(message)


# =========================================================
# SEND EMAIL CHANGE VERIFICATION EMAIL
# =========================================================

def send_email_change_verification_email(
    recipient_email: str,
    verification_token: str
) -> None:

    if not SMTP_USER or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP email configuration is missing. "
            "Configure SMTP_USER and SMTP_PASSWORD."
        )

    verification_link = (
        f"{FRONTEND_URL}/verify-email-change"
        f"?token={verification_token}"
    )

    message = EmailMessage()
    message["Subject"] = "CodeArena Verify New Email"
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = recipient_email

    message.set_content(
        f"""Hello,

We received a request to change your CodeArena email address.

Click the following link to verify your new email address:

{verification_link}

This verification link expires in 15 minutes and can only be used once.

If you did not request this change, you can safely ignore this email.

CodeArena
"""
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT,
        timeout=15
    ) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(
            SMTP_USER,
            SMTP_PASSWORD
        )
        server.send_message(message)


# =========================================================
# TOKEN HELPERS
# =========================================================

def base64_encode(data: bytes) -> str:

    return base64.urlsafe_b64encode(
        data
    ).decode("utf-8").rstrip("=")


def base64_decode(data: str) -> bytes:

    padding = "=" * (
        4 - len(data) % 4
    )

    return base64.urlsafe_b64decode(
        data + padding
    )


def create_token(user_id: int) -> str:

    payload = {
        "user_id": user_id,
        "exp": int(time.time())
        + TOKEN_EXPIRATION_SECONDS
    }

    payload_json = json.dumps(
        payload,
        separators=(",", ":")
    ).encode("utf-8")

    payload_encoded = base64_encode(
        payload_json
    )

    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_encoded.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    return f"{payload_encoded}.{signature}"


def verify_token(token: str):

    try:

        parts = token.split(".")

        if len(parts) != 2:
            return None

        payload_encoded = parts[0]

        provided_signature = parts[1]

        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"),
            payload_encoded.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            provided_signature,
            expected_signature
        ):
            return None

        payload_bytes = base64_decode(
            payload_encoded
        )

        payload = json.loads(
            payload_bytes.decode("utf-8")
        )

        if payload.get("exp", 0) < time.time():
            return None

        return payload

    except Exception:

        return None


# =========================================================
# CURRENT USER AUTHENTICATION
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
):

    if credentials is None:

        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if credentials.scheme.lower() != "bearer":

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication header"
        )

    token = credentials.credentials.strip()

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )

    return user


# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

def require_admin(
    current_user=Depends(get_current_user)
):

    if not current_user.is_admin:

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# =========================================================
# PUBLIC TEST CASE RESPONSE
# =========================================================

class PublicTestCaseResponse(BaseModel):

    id: int

    problem_id: int

    input_data: str


class ChangePasswordRequest(BaseModel):

    current_password: str
    new_password: str
    confirm_new_password: str


class ProfileUpdateRequest(BaseModel):

    username: str


class EmailChangeRequest(BaseModel):

    new_email: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "CodeArena Backend is running!"
    }


# =========================================================
# USER / AUTHENTICATION
# =========================================================


# ---------------------------------------------------------
# REGISTER
# ---------------------------------------------------------

@app.post(
    "/users",
    response_model=UserResponse
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    if len(user.username.strip()) < 3:

        raise HTTPException(
            status_code=400,
            detail=(
                "Username must contain "
                "at least 3 characters"
            )
        )

    if len(user.password) < 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain "
                "at least 6 characters"
            )
        )

    username = user.username.strip()

    email = user.email.strip()

    existing_username = db.query(
        models.User
    ).filter(
        models.User.username == username
    ).first()

    if existing_username:

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(
        models.User
    ).filter(
        models.User.email == email
    ).first()

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = models.User(
        username=username,
        email=email,
        password=hash_password(
            user.password
        )
    )

    try:

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                "Username or email "
                "already exists"
            )
        )

    return new_user


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@app.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.username ==
        user.username
    ).first()

    if existing_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not existing_user.password:

        raise HTTPException(
            status_code=401,
            detail=(
                "This account needs "
                "to be registered again"
            )
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_token(
        existing_user.id
    )

    return {
        "message": "Login successful",

        "token": token,

        "user": existing_user
    }


# =========================================================
# PASSWORD RESET
# =========================================================


# ---------------------------------------------------------
# FORGOT PASSWORD
# ---------------------------------------------------------

@app.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    email = request.email.strip().lower()

    # Always return the same public message so an attacker
    # cannot use this endpoint to discover registered emails.
    generic_message = (
        "If an account exists for this email, "
        "a password reset link has been sent."
    )

    user = db.query(
        models.User
    ).filter(
        models.User.email == email
    ).first()

    if user is None:

        return {
            "message": generic_message
        }

    # -----------------------------------------------------
    # INVALIDATE EXISTING UNUSED TOKENS
    # -----------------------------------------------------

    existing_tokens = db.query(
        models.PasswordResetToken
    ).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used_at.is_(None)
    ).all()

    for existing_token in existing_tokens:

        existing_token.used_at = datetime.utcnow()

    # -----------------------------------------------------
    # GENERATE RESET TOKEN
    # -----------------------------------------------------

    reset_token = secrets.token_urlsafe(32)

    token_hash = hashlib.sha256(
        reset_token.encode("utf-8")
    ).hexdigest()

    reset_record = models.PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=(
            datetime.utcnow()
            + timedelta(minutes=15)
        ),
        used_at=None
    )

    db.add(reset_record)

    db.commit()

    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:

        send_password_reset_email(
            user.email,
            reset_token
        )

    except Exception as email_error:

        # Remove the token if email delivery failed so
        # the user does not end up with an unusable token.
        db.delete(reset_record)
        db.commit()

        print(
            "Password reset email failed:",
            str(email_error)
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "We could not send the password reset "
                "email right now. Please try again later."
            )
        )

    return {
        "message": generic_message
    }


# ---------------------------------------------------------
# RESET PASSWORD
# ---------------------------------------------------------

@app.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    token = request.token.strip()

    new_password = request.new_password

    if not token:

        raise HTTPException(
            status_code=400,
            detail="Reset token is required"
        )

    if len(new_password) < 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain "
                "at least 6 characters"
            )
        )

    # -----------------------------------------------------
    # HASH TOKEN
    # -----------------------------------------------------

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    # -----------------------------------------------------
    # FIND TOKEN
    # -----------------------------------------------------

    reset_record = db.query(
        models.PasswordResetToken
    ).filter(
        models.PasswordResetToken.token_hash ==
        token_hash
    ).first()

    if reset_record is None:

        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )

    # -----------------------------------------------------
    # ONE-TIME TOKEN CHECK
    # -----------------------------------------------------

    if reset_record.used_at is not None:

        raise HTTPException(
            status_code=400,
            detail="Reset token has already been used"
        )

    # -----------------------------------------------------
    # EXPIRATION CHECK
    # -----------------------------------------------------

    if reset_record.expires_at < datetime.utcnow():

        reset_record.used_at = datetime.utcnow()

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = db.query(
        models.User
    ).filter(
        models.User.id ==
        reset_record.user_id
    ).first()

    if user is None:

        reset_record.used_at = datetime.utcnow()

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Account no longer exists"
        )

    # -----------------------------------------------------
    # UPDATE PASSWORD
    # -----------------------------------------------------

    user.password = hash_password(
        new_password
    )

    # -----------------------------------------------------
    # CONSUME TOKEN
    # -----------------------------------------------------

    reset_record.used_at = datetime.utcnow()

    db.commit()

    return {
        "message": (
            "Password reset successful. "
            "You can now login with your new password."
        )
    }


# ---------------------------------------------------------
# CHANGE PASSWORD
# ---------------------------------------------------------

@app.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_password = request.current_password
    new_password = request.new_password
    confirm_new_password = request.confirm_new_password

    if not current_password:

        raise HTTPException(
            status_code=400,
            detail="Current password is required"
        )

    if len(new_password) < 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain "
                "at least 6 characters"
            )
        )

    if new_password != confirm_new_password:

        raise HTTPException(
            status_code=400,
            detail="New passwords do not match"
        )

    if current_password == new_password:

        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password"
        )

    if not current_user.password:

        raise HTTPException(
            status_code=400,
            detail="This account does not have a valid password"
        )

    if not verify_password(
        current_password,
        current_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    current_user.password = hash_password(
        new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully. Please login again with your new password."
    }


# ---------------------------------------------------------
# EDIT PROFILE
# ---------------------------------------------------------

@app.put(
    "/profile",
    response_model=UserResponse
)
def update_profile(
    request: ProfileUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    username = request.username.strip()

    if len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Username must contain at least 3 characters"
        )

    if len(username) > 50:
        raise HTTPException(
            status_code=400,
            detail="Username must contain at most 50 characters"
        )

    existing_user = db.query(
        models.User
    ).filter(
        models.User.username == username,
        models.User.id != current_user.id
    ).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    current_user.username = username

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    return current_user


# ---------------------------------------------------------
# REQUEST EMAIL CHANGE
# ---------------------------------------------------------

@app.post("/request-email-change")
def request_email_change(
    request: EmailChangeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_email = request.new_email.strip().lower()

    if len(new_email) > 255 or "@" not in new_email or "." not in new_email.rsplit("@", 1)[-1]:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address"
        )

    if new_email == current_user.email.lower():
        raise HTTPException(
            status_code=400,
            detail="New email must be different from your current email"
        )

    existing_user = db.query(models.User).filter(
        models.User.email == new_email,
        models.User.id != current_user.id
    ).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=400,
            detail="Email address is already in use"
        )

    # Invalidate previous email-change requests for this user.
    previous_tokens = db.query(EmailChangeToken).filter(
        EmailChangeToken.user_id == current_user.id,
        EmailChangeToken.used_at.is_(None)
    ).all()

    now = datetime.utcnow()
    for previous_token in previous_tokens:
        previous_token.used_at = now

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    record = EmailChangeToken(
        user_id=current_user.id,
        new_email=new_email,
        token_hash=token_hash,
        expires_at=now + timedelta(minutes=15),
        used_at=None
    )

    db.add(record)
    db.commit()

    try:
        send_email_change_verification_email(
            new_email,
            raw_token
        )
    except Exception as email_error:
        db.delete(record)
        db.commit()

        print(
            "Email change verification failed:",
            str(email_error)
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "We could not send the verification email "
                "right now. Please try again later."
            )
        )

    return {
        "message": (
            "Verification email sent to your new email address. "
            "Please check your inbox."
        )
    }


# ---------------------------------------------------------
# VERIFY EMAIL CHANGE
# ---------------------------------------------------------

@app.get("/verify-email-change")
def verify_email_change(
    token: str,
    db: Session = Depends(get_db)
):

    token = token.strip()

    if not token:
        raise HTTPException(
            status_code=400,
            detail="Verification token is required"
        )

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    record = db.query(EmailChangeToken).filter(
        EmailChangeToken.token_hash == token_hash
    ).first()

    if record is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification link"
        )

    if record.used_at is not None:
        raise HTTPException(
            status_code=400,
            detail="Verification link has already been used"
        )

    now = datetime.utcnow()

    if record.expires_at < now:
        record.used_at = now
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Verification link has expired"
        )

    user = db.query(models.User).filter(
        models.User.id == record.user_id
    ).first()

    if user is None:
        record.used_at = now
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Account no longer exists"
        )

    existing_user = db.query(models.User).filter(
        models.User.email == record.new_email,
        models.User.id != user.id
    ).first()

    if existing_user is not None:
        record.used_at = now
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Email address is already in use"
        )

    user.email = record.new_email
    record.used_at = now

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email address is already in use"
        )

    return {
        "message": "Email address verified and updated successfully.",
        "user": user
    }


# =========================================================
# PROBLEMS
# =========================================================


# ---------------------------------------------------------
# CREATE PROBLEM
# ---------------------------------------------------------

@app.post(
    "/problems",
    response_model=ProblemResponse
)
def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    new_problem = models.Problem(
        title=problem.title,
        description=problem.description,
        difficulty=problem.difficulty,
        input_format=problem.input_format,
        output_format=problem.output_format,
        constraints=problem.constraints
    )

    db.add(new_problem)

    db.commit()

    db.refresh(new_problem)

    return new_problem


# ---------------------------------------------------------
# UPDATE PROBLEM
# ---------------------------------------------------------

@app.put(
    "/problems/{problem_id}",
    response_model=ProblemResponse
)
def update_problem(
    problem_id: int,
    problem: ProblemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    existing_problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id == problem_id
    ).first()

    if existing_problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    existing_problem.title = problem.title
    existing_problem.description = problem.description
    existing_problem.difficulty = problem.difficulty
    existing_problem.input_format = (
        problem.input_format
    )
    existing_problem.output_format = (
        problem.output_format
    )
    existing_problem.constraints = (
        problem.constraints
    )

    db.commit()

    db.refresh(existing_problem)

    return existing_problem


# ---------------------------------------------------------
# DELETE PROBLEM
# ---------------------------------------------------------

@app.delete("/problems/{problem_id}")
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    existing_problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id == problem_id
    ).first()

    if existing_problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    existing_submissions = db.query(
        models.Submission
    ).filter(
        models.Submission.problem_id ==
        problem_id
    ).first()

    if existing_submissions is not None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot delete a problem "
                "that already has submissions"
            )
        )

    db.query(
        models.TestCase
    ).filter(
        models.TestCase.problem_id ==
        problem_id
    ).delete(
        synchronize_session=False
    )

    db.delete(existing_problem)

    db.commit()

    return {
        "message": "Problem deleted successfully"
    }


# ---------------------------------------------------------
# GET PROBLEMS
# ---------------------------------------------------------

@app.get(
    "/problems",
    response_model=list[ProblemResponse]
)
def get_problems(
    db: Session = Depends(get_db)
):

    return db.query(
        models.Problem
    ).order_by(
        models.Problem.id.asc()
    ).all()


# ---------------------------------------------------------
# GET SINGLE PROBLEM
# ---------------------------------------------------------

@app.get(
    "/problems/{problem_id}",
    response_model=ProblemResponse
)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db)
):

    problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id == problem_id
    ).first()

    if problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    return problem


# =========================================================
# TEST CASES
# =========================================================


# ---------------------------------------------------------
# CREATE TEST CASE
# ---------------------------------------------------------

@app.post(
    "/test-cases",
    response_model=PublicTestCaseResponse
)
def create_test_case(
    test_case: dict,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    problem_id = test_case.get(
        "problem_id"
    )

    input_data = test_case.get(
        "input_data"
    )

    expected_output = test_case.get(
        "expected_output"
    )

    if problem_id is None:

        raise HTTPException(
            status_code=400,
            detail="problem_id is required"
        )

    if input_data is None:

        raise HTTPException(
            status_code=400,
            detail="input_data is required"
        )

    if expected_output is None:

        raise HTTPException(
            status_code=400,
            detail="expected_output is required"
        )

    problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id == problem_id
    ).first()

    if problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    new_test_case = models.TestCase(
        problem_id=problem_id,
        input_data=str(input_data),
        expected_output=str(expected_output)
    )

    db.add(new_test_case)

    db.commit()

    db.refresh(new_test_case)

    return {
        "id": new_test_case.id,
        "problem_id": new_test_case.problem_id,
        "input_data": new_test_case.input_data
    }


# ---------------------------------------------------------
# GET TEST CASES
# ---------------------------------------------------------

@app.get(
    "/problems/{problem_id}/test-cases",
    response_model=list[PublicTestCaseResponse]
)
def get_test_cases(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id == problem_id
    ).first()

    if problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    test_cases = db.query(
        models.TestCase
    ).filter(
        models.TestCase.problem_id ==
        problem_id
    ).all()

    return [
        {
            "id": test_case.id,
            "problem_id": test_case.problem_id,
            "input_data": test_case.input_data
        }
        for test_case in test_cases
    ]


# ---------------------------------------------------------
# UPDATE TEST CASE
# ---------------------------------------------------------

@app.put(
    "/test-cases/{test_case_id}",
    response_model=PublicTestCaseResponse
)
def update_test_case(
    test_case_id: int,
    test_case: TestCaseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    existing_test_case = db.query(
        models.TestCase
    ).filter(
        models.TestCase.id == test_case_id
    ).first()

    if existing_test_case is None:

        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    existing_test_case.input_data = (
        test_case.input_data
    )

    existing_test_case.expected_output = (
        test_case.expected_output
    )

    db.commit()

    db.refresh(existing_test_case)

    return {
        "id": existing_test_case.id,
        "problem_id": existing_test_case.problem_id,
        "input_data": existing_test_case.input_data
    }


# ---------------------------------------------------------
# DELETE TEST CASE
# ---------------------------------------------------------

@app.delete("/test-cases/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    existing_test_case = db.query(
        models.TestCase
    ).filter(
        models.TestCase.id == test_case_id
    ).first()

    if existing_test_case is None:

        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    db.delete(existing_test_case)

    db.commit()

    return {
        "message": "Test case deleted successfully"
    }


# =========================================================
# SUBMISSIONS / JUDGE
# =========================================================


# ---------------------------------------------------------
# CREATE SUBMISSION
# ---------------------------------------------------------

@app.post(
    "/submissions",
    response_model=SubmissionResponse
)
def create_submission(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # IMPORTANT:
    #
    # Never trust submission.user_id.
    #
    # We use the authenticated user
    # from the signed token.

    user = current_user

    problem = db.query(
        models.Problem
    ).filter(
        models.Problem.id ==
        submission.problem_id
    ).first()

    if problem is None:

        raise HTTPException(
            status_code=404,
            detail="Problem not found"
        )

    test_cases = db.query(
        models.TestCase
    ).filter(
        models.TestCase.problem_id ==
        submission.problem_id
    ).all()

    if not test_cases:

        raise HTTPException(
            status_code=400,
            detail=(
                "No test cases found "
                "for this problem"
            )
        )

    language = (
        submission.language
        .lower()
        .strip()
    )

    if language not in [
        "python",
        "cpp",
        "c++"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    # -----------------------------------------------------
    # SAVE SUBMISSION
    # -----------------------------------------------------

    new_submission = models.Submission(

        user_id=user.id,

        problem_id=submission.problem_id,

        code=submission.code,

        language=language,

        verdict="Running",

        submitted_at=datetime.utcnow(),

        runtime=0.0,

        tests_passed=0,

        total_tests=len(test_cases)
    )

    db.add(new_submission)

    db.commit()

    db.refresh(new_submission)

    # -----------------------------------------------------
    # RUN TEST CASES
    # -----------------------------------------------------

    verdict = "Accepted"

    tests_passed = 0

    total_runtime = 0.0

    for test_case in test_cases:

        test_start_time = time.perf_counter()

        try:

            result = execute_code(
                submission.code,
                language,
                test_case.input_data
            )

        except Exception:

            total_runtime += (
                time.perf_counter()
                - test_start_time
            )

            verdict = "Runtime Error"

            break

        total_runtime += (
            time.perf_counter()
            - test_start_time
        )

        if result["status"] == (
            "Compilation Error"
        ):

            verdict = "Compilation Error"

            break

        if result["status"] == (
            "Time Limit Exceeded"
        ):

            verdict = "Time Limit Exceeded"

            break

        if result["status"] == (
            "Runtime Error"
        ):

            verdict = "Runtime Error"

            break

        actual_output = (
            result["output"]
            .strip()
        )

        expected_output = (
            test_case.expected_output
            .strip()
        )

        if actual_output != expected_output:

            verdict = "Wrong Answer"

            break

        tests_passed += 1

    # -----------------------------------------------------
    # UPDATE SUBMISSION METADATA
    # -----------------------------------------------------

    new_submission.verdict = verdict

    new_submission.runtime = total_runtime

    new_submission.tests_passed = tests_passed

    new_submission.total_tests = len(test_cases)

    db.commit()

    db.refresh(new_submission)

    return new_submission


# ---------------------------------------------------------
# GET ALL SUBMISSIONS
# ---------------------------------------------------------

@app.get(
    "/submissions",
    response_model=list[SubmissionResponse]
)
def get_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        models.Submission
    ).filter(
        models.Submission.user_id ==
        current_user.id
    ).order_by(
        models.Submission.id.desc()
    ).all()


# ---------------------------------------------------------
# GET CURRENT USER SUBMISSIONS
# ---------------------------------------------------------

@app.get(
    "/users/{user_id}/submissions",
    response_model=list[SubmissionResponse]
)
def get_user_submissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # A user can only access
    # their own submissions.

    if user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail=(
                "You can only view "
                "your own submissions"
            )
        )

    return db.query(
        models.Submission
    ).filter(
        models.Submission.user_id ==
        current_user.id
    ).order_by(
        models.Submission.id.desc()
    ).all()


# ---------------------------------------------------------
# GET SINGLE SUBMISSION
# ---------------------------------------------------------

@app.get(
    "/submissions/{submission_id}",
    response_model=SubmissionResponse
)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    submission = db.query(
        models.Submission
    ).filter(
        models.Submission.id ==
        submission_id
    ).first()

    if submission is None:

        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    # Users cannot view another
    # user's submitted code.

    if submission.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail=(
                "You can only view "
                "your own submission"
            )
        )

    return submission