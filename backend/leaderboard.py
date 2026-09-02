from fastapi import APIRouter
from database import SessionLocal
import models


router = APIRouter()


# =========================================================
# GET LEADERBOARD
# =========================================================

@router.get("/leaderboard")
def get_leaderboard():

    db = SessionLocal()

    try:

        # -------------------------------------------------
        # GET DATA
        # -------------------------------------------------

        users = (
            db.query(models.User)
            .order_by(models.User.id.asc())
            .all()
        )

        submissions = (
            db.query(models.Submission)
            .all()
        )

        leaderboard = []

        # -------------------------------------------------
        # CALCULATE USER STATISTICS
        # -------------------------------------------------

        for user in users:

            user_submissions = [
                submission
                for submission in submissions
                if submission.user_id == user.id
            ]

            accepted_submissions = [
                submission
                for submission in user_submissions
                if submission.verdict == "Accepted"
            ]

            # ---------------------------------------------
            # UNIQUE PROBLEMS SOLVED
            # ---------------------------------------------

            solved_problems = len(
                set(
                    submission.problem_id
                    for submission in accepted_submissions
                )
            )

            # ---------------------------------------------
            # SUBMISSION COUNTS
            # ---------------------------------------------

            total_submissions = len(
                user_submissions
            )

            accepted_count = len(
                accepted_submissions
            )

            # ---------------------------------------------
            # SUCCESS RATE
            # ---------------------------------------------

            if total_submissions > 0:

                success_rate = round(
                    (
                        accepted_count
                        / total_submissions
                    ) * 100
                )

            else:

                success_rate = 0

            # ---------------------------------------------
            # LEADERBOARD ENTRY
            # ---------------------------------------------

            leaderboard.append(
                {
                    "user_id": user.id,
                    "username": user.username,
                    "solved": solved_problems,
                    "accepted": accepted_count,
                    "submissions": total_submissions,
                    "success_rate": success_rate
                }
            )

        # =================================================
        # RANKING
        # =================================================
        #
        # Priority:
        #
        # 1. More problems solved
        # 2. More accepted submissions
        # 3. Fewer total submissions
        # 4. Smaller user ID for deterministic ordering
        #
        # =================================================

        leaderboard.sort(
            key=lambda user: (
                -user["solved"],
                -user["accepted"],
                user["submissions"],
                user["user_id"]
            )
        )

        # =================================================
        # ASSIGN RANK
        # =================================================

        for index, user in enumerate(
            leaderboard,
            start=1
        ):

            user["rank"] = index

        # =================================================
        # RETURN RESULT
        # =================================================

        return leaderboard

    finally:

        db.close()