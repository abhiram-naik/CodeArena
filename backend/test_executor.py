from executor import execute_code

passed = 0
total = 0


def test(name, code, language, input_data, expected_status):
    global passed, total
    total += 1

    try:
        result = execute_code(code, language, input_data)
        status = result.get("status")

        if status == expected_status:
            print(f"[PASS] {name}")
            passed += 1

        else:
            print(f"[FAIL] {name}")
            print(f"       Expected: {expected_status}")
            print(f"       Got:      {status}")

            if result.get("output"):
                print(
                    f"       Output:   "
                    f"{result['output'][:300]!r}"
                )

    except Exception as e:

        print(f"[FAIL] {name}")
        print(f"       Test crashed: {e}")


print("=" * 60)
print("CODEARENA EXECUTOR TEST")
print("=" * 60)


# =========================================================
# 1. CORRECT PYTHON
# =========================================================

test(
    "Python Correct",

    """n = int(input())
a = list(map(int, input().split()))

a = [
    x
    for x in a
    if x != 0
] + [0] * a.count(0)

print(*a)
""",

    "python",

    "5\n0 1 0 3 12\n",

    "Success"
)


# =========================================================
# 2. CORRECT C++
# =========================================================

test(
    "C++ Correct",

    """#include <iostream>
#include <vector>

using namespace std;

int main() {

    int n;
    cin >> n;

    vector<int> a(n);

    for (int &x : a) {
        cin >> x;
    }

    int index = 0;

    for (int x : a) {

        if (x != 0) {
            a[index++] = x;
        }
    }

    while (index < n) {
        a[index++] = 0;
    }

    for (int x : a) {
        cout << x << " ";
    }

    return 0;
}
""",

    "cpp",

    "5\n0 1 0 3 12\n",

    "Success"
)


# =========================================================
# 3. PYTHON RUNTIME ERROR
# =========================================================

test(
    "Python Runtime Error",

    """print(10 / 0)
""",

    "python",

    "",

    "Runtime Error"
)


# =========================================================
# 4. C++ COMPILATION ERROR
# =========================================================

test(
    "C++ Compilation Error",

    """#include <iostream>

int main() {

    this_is_not_valid_cpp

}
""",

    "cpp",

    "",

    "Compilation Error"
)


# =========================================================
# 5. PYTHON TIME LIMIT
# =========================================================

test(
    "Python Time Limit",

    """while True:
    pass
""",

    "python",

    "",

    "Time Limit Exceeded"
)


# =========================================================
# 6. C++ TIME LIMIT
# =========================================================

test(
    "C++ Time Limit",

    """int main() {

    while (true) {
    }

}
""",

    "cpp",

    "",

    "Time Limit Exceeded"
)


# =========================================================
# 7. OUTPUT SIZE LIMIT
# =========================================================
#
# IMPORTANT:
#
# The old version used an infinite loop:
#
#     while True:
#         print("A" * 1000000)
#
# That naturally triggered the 3-second timeout first.
#
# This version produces more than 1 MB and then exits.
#
# MAX_OUTPUT_SIZE = 1 MB
#
# =========================================================

test(
    "Output Size Limit",

    """print("A" * 1100000)
""",

    "python",

    "",

    "Runtime Error"
)


# =========================================================
# 8. CODE SIZE LIMIT
# =========================================================

test(
    "Code Size Limit",

    "print('A')\n" + ("#" * 100001),

    "python",

    "",

    "Runtime Error"
)


# =========================================================
# 9. INPUT SIZE LIMIT
# =========================================================

test(
    "Input Size Limit",

    "print(input())",

    "python",

    "A" * 100001,

    "Runtime Error"
)


# =========================================================
# 10. UNSUPPORTED LANGUAGE
# =========================================================

test(
    "Unsupported Language",

    "print('hello')",

    "java",

    "",

    "Unsupported Language"
)


# =========================================================
# 11. PYTHON INPUT HANDLING
# =========================================================

test(
    "Python Input Handling",

    """a = int(input())
b = int(input())

print(a + b)
""",

    "python",

    "10\n20\n",

    "Success"
)


# =========================================================
# 12. C++ INPUT HANDLING
# =========================================================

test(
    "C++ Input Handling",

    """#include <iostream>

using namespace std;

int main() {

    int a, b;

    cin >> a >> b;

    cout << a + b;

    return 0;
}
""",

    "cpp",

    "10 20\n",

    "Success"
)


# =========================================================
# FINAL RESULT
# =========================================================

print("=" * 60)

print(
    f"RESULT: {passed}/{total} TESTS PASSED"
)

print("=" * 60)


if passed != total:

    raise SystemExit(1)