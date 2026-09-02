from database import SessionLocal
import models


def seed_problems():
    db = SessionLocal()

    try:
        problems = [
            {
                "title": "Sum of Array",
                "description": "Given an array of integers, print the sum of all elements.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "1 2 3 4 5", "expected_output": "15"},
                    {"input_data": "10 20 30", "expected_output": "60"},
                    {"input_data": "5", "expected_output": "5"},
                    {"input_data": "-1 2 -3 4", "expected_output": "2"},
                ],
            },
            {
                "title": "Reverse String",
                "description": "Given a string, print the string in reverse order.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "hello", "expected_output": "olleh"},
                    {"input_data": "CodeArena", "expected_output": "anerAedoC"},
                    {"input_data": "python", "expected_output": "nohtyp"},
                    {"input_data": "abc", "expected_output": "cba"},
                ],
            },
            {
                "title": "Count Vowels",
                "description": "Given a string, count and print the number of vowels in it.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "hello", "expected_output": "2"},
                    {"input_data": "programming", "expected_output": "3"},
                    {"input_data": "AEIOU", "expected_output": "5"},
                    {"input_data": "xyz", "expected_output": "0"},
                ],
            },
            {
                "title": "Factorial",
                "description": "Given a non-negative integer n, print n factorial.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "5", "expected_output": "120"},
                    {"input_data": "0", "expected_output": "1"},
                    {"input_data": "3", "expected_output": "6"},
                    {"input_data": "7", "expected_output": "5040"},
                ],
            },
            {
                "title": "Maximum Element",
                "description": "Given an array of integers, print the largest element.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "1 5 3 9 2", "expected_output": "9"},
                    {"input_data": "10 20 5", "expected_output": "20"},
                    {"input_data": "-5 -2 -10", "expected_output": "-2"},
                    {"input_data": "7", "expected_output": "7"},
                ],
            },
            {
                "title": "Palindrome Number",
                "description": "Given an integer, print Yes if it is a palindrome, otherwise print No.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "121", "expected_output": "Yes"},
                    {"input_data": "123", "expected_output": "No"},
                    {"input_data": "1221", "expected_output": "Yes"},
                    {"input_data": "10", "expected_output": "No"},
                ],
            },
            {
                "title": "Fibonacci Number",
                "description": "Given n, print the nth Fibonacci number. Assume Fibonacci starts with F(0)=0 and F(1)=1.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "0", "expected_output": "0"},
                    {"input_data": "1", "expected_output": "1"},
                    {"input_data": "5", "expected_output": "5"},
                    {"input_data": "10", "expected_output": "55"},
                ],
            },
            {
                "title": "Prime Number",
                "description": "Given an integer n, print Yes if n is prime, otherwise print No.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "2", "expected_output": "Yes"},
                    {"input_data": "7", "expected_output": "Yes"},
                    {"input_data": "10", "expected_output": "No"},
                    {"input_data": "1", "expected_output": "No"},
                ],
            },
            {
                "title": "Count Digits",
                "description": "Given a non-negative integer, print the number of digits in it.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "12345", "expected_output": "5"},
                    {"input_data": "7", "expected_output": "1"},
                    {"input_data": "1000", "expected_output": "4"},
                    {"input_data": "999999", "expected_output": "6"},
                ],
            },

            # ---------------------------------------------------------
            # NEW PROBLEMS
            # ---------------------------------------------------------

            {
                "title": "Remove Duplicates from Sorted Array",
                "description": "Given a sorted array of integers, remove duplicate values and print the resulting array.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "1 1 2 2 3", "expected_output": "1 2 3"},
                    {"input_data": "1 1 1 1", "expected_output": "1"},
                    {"input_data": "1 2 3 4 5", "expected_output": "1 2 3 4 5"},
                    {"input_data": "-2 -2 -1 0 0 3", "expected_output": "-2 -1 0 3"},
                    {"input_data": "5", "expected_output": "5"},
                ],
            },

            {
                "title": "Move Zeroes",
                "description": "Given an array of integers, move all zeroes to the end while maintaining the relative order of non-zero elements.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "0 1 0 3 12", "expected_output": "1 3 12 0 0"},
                    {"input_data": "0 0 1", "expected_output": "1 0 0"},
                    {"input_data": "1 2 3", "expected_output": "1 2 3"},
                    {"input_data": "0 0 0", "expected_output": "0 0 0"},
                    {"input_data": "4 0 5 0 2 0", "expected_output": "4 5 2 0 0 0"},
                ],
            },

            {
                "title": "Best Time to Buy and Sell Stock",
                "description": "Given an array of stock prices, find the maximum profit that can be achieved by buying on one day and selling on a later day.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "7 1 5 3 6 4", "expected_output": "5"},
                    {"input_data": "7 6 4 3 1", "expected_output": "0"},
                    {"input_data": "1 2", "expected_output": "1"},
                    {"input_data": "2 4 1", "expected_output": "2"},
                    {"input_data": "3 3 5 0 0 3 1 4", "expected_output": "4"},
                ],
            },

            {
                "title": "Missing Number",
                "description": "Given an array containing n distinct numbers taken from 0 to n, find the one number that is missing.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "3 0 1", "expected_output": "2"},
                    {"input_data": "3 0 1 2", "expected_output": "3"},
                    {"input_data": "1 0", "expected_output": "1"},
                    {"input_data": "5 0 1 2 3 4", "expected_output": "5"},
                    {"input_data": "4 0 1 3 4", "expected_output": "2"},
                ],
            },

            {
                "title": "First Non-Repeating Character",
                "description": "Given a string, print the first character that appears only once. Print -1 if every character repeats.",
                "difficulty": "Easy",
                "test_cases": [
                    {"input_data": "leetcode", "expected_output": "l"},
                    {"input_data": "loveleetcode", "expected_output": "v"},
                    {"input_data": "aabbcc", "expected_output": "-1"},
                    {"input_data": "abcabcde", "expected_output": "d"},
                    {"input_data": "z", "expected_output": "z"},
                ],
            },

            {
                "title": "Climbing Stairs",
                "description": "You are climbing a staircase with n steps. Each time you can climb either 1 or 2 steps. Print the number of distinct ways to reach the top.",
                "difficulty": "Medium",
                "test_cases": [
                    {"input_data": "1", "expected_output": "1"},
                    {"input_data": "2", "expected_output": "2"},
                    {"input_data": "3", "expected_output": "3"},
                    {"input_data": "5", "expected_output": "8"},
                    {"input_data": "10", "expected_output": "89"},
                ],
            },

            {
                "title": "Number of Islands",
                "description": "Given a binary grid where 1 represents land and 0 represents water, count the number of islands. The first line contains rows and columns, followed by the grid.",
                "difficulty": "Medium",
                "test_cases": [
                    {
                        "input_data": "4 5\n11110\n11000\n11000\n00000",
                        "expected_output": "1",
                    },
                    {
                        "input_data": "4 5\n11000\n11000\n00100\n00011",
                        "expected_output": "3",
                    },
                    {
                        "input_data": "3 3\n111\n010\n111",
                        "expected_output": "1",
                    },
                    {
                        "input_data": "3 3\n100\n010\n001",
                        "expected_output": "3",
                    },
                    {
                        "input_data": "2 2\n00\n00",
                        "expected_output": "0",
                    },
                ],
            },
        ]

        for problem_data in problems:

            existing_problem = (
                db.query(models.Problem)
                .filter(
                    models.Problem.title == problem_data["title"]
                )
                .first()
            )

            if existing_problem:
                print(
                    f"Problem already exists: "
                    f"{problem_data['title']}"
                )
                continue

            new_problem = models.Problem(
                title=problem_data["title"],
                description=problem_data["description"],
                difficulty=problem_data["difficulty"],
            )

            db.add(new_problem)
            db.commit()
            db.refresh(new_problem)

            print(
                f"Created Problem #{new_problem.id}: "
                f"{new_problem.title}"
            )

            for test_data in problem_data["test_cases"]:

                new_test_case = models.TestCase(
                    problem_id=new_problem.id,
                    input_data=test_data["input_data"],
                    expected_output=test_data["expected_output"],
                )

                db.add(new_test_case)

            db.commit()

            print(
                f"Added "
                f"{len(problem_data['test_cases'])} "
                f"test cases."
            )

        print()
        print("Database seeding completed successfully.")

    except Exception as error:
        db.rollback()

        print()
        print("Error while seeding database:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_problems()