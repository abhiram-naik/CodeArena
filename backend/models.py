from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Boolean,
    DateTime,
    Float
)

from database import Base


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # ADMIN ROLE
    # -----------------------------------------------------

    is_admin = Column(
        Boolean,
        nullable=False,
        default=False
    )


# =========================================================
# PASSWORD RESET TOKEN
# =========================================================

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    token_hash = Column(
        String,
        nullable=False,
        index=True
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )

    used_at = Column(
        DateTime,
        nullable=True
    )


# =========================================================
# PROBLEM
# =========================================================

class Problem(Base):
    __tablename__ = "problems"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    difficulty = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # PROBLEM INFORMATION
    # -----------------------------------------------------

    input_format = Column(
        Text,
        nullable=True
    )

    output_format = Column(
        Text,
        nullable=True
    )

    constraints = Column(
        Text,
        nullable=True
    )


# =========================================================
# TEST CASE
# =========================================================

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    problem_id = Column(
        Integer,
        ForeignKey("problems.id"),
        nullable=False
    )

    input_data = Column(
        Text,
        nullable=False
    )

    expected_output = Column(
        Text,
        nullable=False
    )


# =========================================================
# SUBMISSION
# =========================================================

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    problem_id = Column(
        Integer,
        ForeignKey("problems.id"),
        nullable=False
    )

    code = Column(
        Text,
        nullable=False
    )

    language = Column(
        String,
        nullable=False
    )

    verdict = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # SUBMISSION METADATA
    # -----------------------------------------------------

    submitted_at = Column(
        DateTime,
        nullable=False
    )

    runtime = Column(
        Float,
        nullable=True
    )

    tests_passed = Column(
        Integer,
        nullable=False,
        default=0
    )

    total_tests = Column(
        Integer,
        nullable=False,
        default=0
    )