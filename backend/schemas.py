from datetime import datetime

from pydantic import BaseModel


# =========================================================
# USER
# =========================================================

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    user: UserResponse


# =========================================================
# PASSWORD RESET
# =========================================================

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# =========================================================
# PROBLEM
# =========================================================

class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str

    input_format: str | None = None
    output_format: str | None = None
    constraints: str | None = None


class ProblemUpdate(BaseModel):
    title: str
    description: str
    difficulty: str

    input_format: str | None = None
    output_format: str | None = None
    constraints: str | None = None


class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str

    input_format: str | None = None
    output_format: str | None = None
    constraints: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# TEST CASE
# =========================================================

class TestCaseCreate(BaseModel):
    problem_id: int
    input_data: str
    expected_output: str


class TestCaseUpdate(BaseModel):
    input_data: str
    expected_output: str


class TestCaseResponse(BaseModel):
    id: int
    problem_id: int
    input_data: str
    expected_output: str

    class Config:
        from_attributes = True


# =========================================================
# SUBMISSION
# =========================================================

class SubmissionCreate(BaseModel):
    user_id: int
    problem_id: int
    code: str
    language: str


class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    code: str
    language: str
    verdict: str
    submitted_at: datetime
    runtime: float | None = None
    tests_passed: int
    total_tests: int

    class Config:
        from_attributes = True