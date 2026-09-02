import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("codearena_token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
};


function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("codearena_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("codearena_token") || ""
  );

  // =========================================================
  // PASSWORD RESET ROUTE
  // =========================================================

  const [isPasswordResetRoute, setIsPasswordResetRoute] = useState(
    () => window.location.pathname === "/reset-password"
  );

  // =========================================================
  // EMAIL CHANGE VERIFICATION ROUTE
  // =========================================================

  const [isEmailVerificationRoute, setIsEmailVerificationRoute] = useState(
    () => window.location.pathname === "/verify-email-change"
  );

  const [emailVerificationToken, setEmailVerificationToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });

  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState("");
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);

  const [authMode, setAuthMode] = useState(
    () =>
      window.location.pathname === "/reset-password"
        ? "reset"
        : "login"
  );
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // =========================================================
  // PASSWORD RESET STATE
  // =========================================================

  const [resetEmail, setResetEmail] = useState("");

  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });

  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  // =========================================================
  // CHANGE PASSWORD STATE
  // =========================================================

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordCurrent, setChangePasswordCurrent] = useState("");
  const [changePasswordNew, setChangePasswordNew] = useState("");
  const [changePasswordConfirm, setChangePasswordConfirm] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // =========================================================
  // EDIT PROFILE STATE
  // =========================================================

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [showProblems, setShowProblems] = useState(false);

  // =========================================================
  // PROBLEM SEARCH & FILTER STATE
  // =========================================================

  const [problemSearch, setProblemSearch] = useState("");
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState("All");

  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [adminTitle, setAdminTitle] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminDifficulty, setAdminDifficulty] = useState("Easy");
  const [adminInputFormat, setAdminInputFormat] = useState("");
  const [adminOutputFormat, setAdminOutputFormat] = useState("");
  const [adminConstraints, setAdminConstraints] = useState("");
  const [adminProblemId, setAdminProblemId] = useState("");
  const [adminTestInput, setAdminTestInput] = useState("");
  const [adminExpectedOutput, setAdminExpectedOutput] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Admin problem-management state
  const [adminProblemsLoading, setAdminProblemsLoading] = useState(false);
  const [adminTestCases, setAdminTestCases] = useState([]);
  const [adminSelectedProblem, setAdminSelectedProblem] = useState(null);
  const [adminTestCasesLoading, setAdminTestCasesLoading] = useState(false);

  const [adminEditingProblem, setAdminEditingProblem] = useState(null);
  const [adminEditTitle, setAdminEditTitle] = useState("");
  const [adminEditDescription, setAdminEditDescription] = useState("");
  const [adminEditDifficulty, setAdminEditDifficulty] = useState("Easy");
  const [adminEditInputFormat, setAdminEditInputFormat] = useState("");
  const [adminEditOutputFormat, setAdminEditOutputFormat] = useState("");
  const [adminEditConstraints, setAdminEditConstraints] = useState("");
  const [adminEditingTestCase, setAdminEditingTestCase] = useState(null);
  const [adminEditTestInput, setAdminEditTestInput] = useState("");
  const [adminEditExpectedOutput, setAdminEditExpectedOutput] = useState("");

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const authHeaders = () => {
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`
    };
  };

  // =========================================================
  // PROBLEM TEMPLATES
  // =========================================================

  const problemTemplates = {
    "two sum": {
      python: `numbers = list(map(int, input().split()))
target = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers;
    int x;

    while (cin >> x) {
        numbers.push_back(x);
    }

    if (numbers.size() < 2) {
        return 0;
    }

    int target = numbers.back();
    numbers.pop_back();

    // Write your solution here

    return 0;
}`
    },

    "sum of array": {
      python: `numbers = list(map(int, input().split()))

# Write your solution here
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers;
    int x;

    while (cin >> x) {
        numbers.push_back(x);
    }

    // Write your solution here

    return 0;
}`
    },

    "reverse string": {
      python: `s = input()

# Write your solution here
`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // Write your solution here

    return 0;
}`
    },

    "count vowels": {
      python: `s = input()

# Write your solution here
`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // Write your solution here

    return 0;
}`
    },

    factorial: {
      python: `n = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`
    },

    "maximum element": {
      python: `numbers = list(map(int, input().split()))

# Write your solution here
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers;
    int x;

    while (cin >> x) {
        numbers.push_back(x);
    }

    // Write your solution here

    return 0;
}`
    },

    "palindrome number": {
      python: `n = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`
    },

    "fibonacci number": {
      python: `n = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`
    },

    "prime number": {
      python: `n = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`
    },

    "count digits": {
      python: `n = int(input())

# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your solution here

    return 0;
}`
    }
  };

  // =========================================================
  // GET PROBLEM TEMPLATE
  // =========================================================

  const getProblemTemplates = (problem) => {
    const title = problem?.title?.toLowerCase().trim() || "";

    if (problemTemplates[title]) {
      return problemTemplates[title];
    }

    if (title.includes("two sum")) {
      return problemTemplates["two sum"];
    }

    if (
      title.includes("sum") &&
      title.includes("array")
    ) {
      return problemTemplates["sum of array"];
    }

    if (
      title.includes("reverse") &&
      title.includes("string")
    ) {
      return problemTemplates["reverse string"];
    }

    if (title.includes("vowel")) {
      return problemTemplates["count vowels"];
    }

    if (title.includes("factorial")) {
      return problemTemplates.factorial;
    }

    if (
      title.includes("maximum") ||
      title.includes("max element")
    ) {
      return problemTemplates["maximum element"];
    }

    if (
      title.includes("palindrome") &&
      title.includes("number")
    ) {
      return problemTemplates["palindrome number"];
    }

    if (title.includes("fibonacci")) {
      return problemTemplates["fibonacci number"];
    }

    if (title.includes("prime")) {
      return problemTemplates["prime number"];
    }

    if (title.includes("digit")) {
      return problemTemplates["count digits"];
    }

    return {
      python: `# ${problem?.title || "Problem"}

# Read input according to the problem statement
# Write your solution here
`,
      cpp: `#include <iostream>
using namespace std;

int main() {

    // Write your solution here

    return 0;
}`
    };
  };

  // =========================================================
  // HANDLE PASSWORD RESET URL
  // =========================================================

  useEffect(() => {
    const isResetPath =
      window.location.pathname === "/reset-password";

    setIsPasswordResetRoute(isResetPath);

    if (isResetPath) {
      const params = new URLSearchParams(
        window.location.search
      );

      const tokenFromUrl =
        params.get("token") || "";

      setResetToken(tokenFromUrl);
      setAuthMode("reset");

      if (!tokenFromUrl) {
        setAuthMessage(
          "This password reset link is missing a valid token."
        );
      } else {
        setAuthMessage("");
      }
    }
  }, []);

  // =========================================================
  // HANDLE EMAIL CHANGE VERIFICATION URL
  // =========================================================

  useEffect(() => {
    const isVerifyPath =
      window.location.pathname === "/verify-email-change";

    setIsEmailVerificationRoute(isVerifyPath);

    if (!isVerifyPath) {
      return;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const tokenFromUrl =
      params.get("token") || "";

    setEmailVerificationToken(tokenFromUrl);

    if (!tokenFromUrl) {
      setEmailVerificationSuccess(false);
      setEmailVerificationMessage(
        "This email verification link is missing a valid token."
      );
      return;
    }

    const verifyEmailChange = async () => {
      setEmailVerificationLoading(true);
      setEmailVerificationMessage("");
      setEmailVerificationSuccess(false);

      try {
        const response = await fetch(
          `${API_BASE}/verify-email-change?token=${encodeURIComponent(tokenFromUrl)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setEmailVerificationMessage(
            typeof data.detail === "string"
              ? data.detail
              : "Email verification failed."
          );
          return;
        }

        const updatedUser = data.user || null;

        if (updatedUser && updatedUser.id) {
          setUser(updatedUser);
          localStorage.setItem(
            "codearena_user",
            JSON.stringify(updatedUser)
          );
        }

        setEmailVerificationSuccess(true);
        setEmailVerificationMessage(
          data.message ||
          "Email address verified and updated successfully."
        );
      } catch {
        setEmailVerificationMessage(
          "Could not connect to backend. Please try again."
        );
      } finally {
        setEmailVerificationLoading(false);
      }
    };

    verifyEmailChange();
  }, []);

  const finishEmailVerification = () => {
    setIsEmailVerificationRoute(false);
    setEmailVerificationToken("");
    setEmailVerificationMessage("");
    setEmailVerificationSuccess(false);

    window.history.replaceState(
      {},
      document.title,
      "/"
    );
  };

  // =========================================================
  // SAVE USER
  // =========================================================

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "codearena_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("codearena_user");
    }
  }, [user]);

  // =========================================================
  // SAVE TOKEN
  // =========================================================

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "codearena_token",
        token
      );
    } else {
      localStorage.removeItem(
        "codearena_token"
      );
    }
  }, [token]);

  // =========================================================
  // LOAD USER SUBMISSIONS ON APP START / LOGIN
  // =========================================================
  // Homepage statistics are calculated from the user's submissions.
  // Load them immediately when a valid user session exists so the
  // homepage does not show 0 until the Profile page is opened.
  useEffect(() => {
    if (!user || !token) {
      if (!user) {
        setSubmissions([]);
      }
      return;
    }

    const loadUserSubmissions = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/users/${user.id}/submissions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          console.error(
            "Could not load user submissions:",
            response.status
          );
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setSubmissions(data);
        }
      } catch (error) {
        console.error(
          "Could not load user submissions:",
          error
        );
      }
    };

    loadUserSubmissions();
  }, [user, token]);

  // =========================================================
  // CLEAR AUTH FIELDS
  // =========================================================

  const clearAuthFields = () => {
    setAuthUsername("");
    setAuthEmail("");
    setAuthPassword("");
    setResetEmail("");
    setResetToken("");
    setResetPassword("");
    setResetConfirmPassword("");
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setAuthMessage("");
    setAuthLoading(true);

    const email = resetEmail.trim();

    if (!email) {
      setAuthMessage("Please enter your registered email.");
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not process password reset request."
        );
        setAuthLoading(false);
        return;
      }

      // Development mode returns a reset token so the local flow
      // can be tested without an email provider.
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setAuthMode("reset");
        setAuthMessage(
          "Reset token generated. Enter a new password below."
        );
      } else {
        setAuthMessage(
          data.message ||
          "If an account exists for this email, a reset link has been generated."
        );
      }
    } catch {
      setAuthMessage("Could not connect to backend.");
    }

    setAuthLoading(false);
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setAuthMessage("");
    setAuthLoading(true);

    if (!resetToken.trim()) {
      setAuthMessage("Please enter your reset token.");
      setAuthLoading(false);
      return;
    }

    if (resetPassword.length < 6) {
      setAuthMessage("Password must contain at least 6 characters.");
      setAuthLoading(false);
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setAuthMessage("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: resetToken.trim(),
            new_password: resetPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Password reset failed."
        );
        setAuthLoading(false);
        return;
      }

      setAuthMessage(
        data.message ||
        "Password reset successful. You can now login with your new password."
      );

      setAuthPassword("");
      setResetPassword("");
      setResetConfirmPassword("");
      setResetToken("");

      setTimeout(() => {
        // A password reset should return the user to a clean login state.
        setUser(null);
        setToken("");
        setAuthMode("login");
        setIsPasswordResetRoute(false);
        setAuthMessage(
          "Password reset successful. Please login with your new password."
        );

        window.history.replaceState(
          {},
          document.title,
          "/"
        );
      }, 900);
    } catch {
      setAuthMessage("Could not connect to backend.");
    }

    setAuthLoading(false);
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!user || !token) {
      setAuthMode("login");
      return;
    }

    setChangePasswordLoading(true);
    setMessage("");

    if (!changePasswordCurrent) {
      setMessage("Please enter your current password.");
      setChangePasswordLoading(false);
      return;
    }

    if (changePasswordNew.length < 6) {
      setMessage("New password must contain at least 6 characters.");
      setChangePasswordLoading(false);
      return;
    }

    if (changePasswordNew !== changePasswordConfirm) {
      setMessage("New passwords do not match.");
      setChangePasswordLoading(false);
      return;
    }

    if (changePasswordCurrent === changePasswordNew) {
      setMessage("New password must be different from your current password.");
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            current_password: changePasswordCurrent,
            new_password: changePasswordNew,
            confirm_new_password: changePasswordConfirm
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not change password."
        );
        setChangePasswordLoading(false);
        return;
      }

      setChangePasswordCurrent("");
      setChangePasswordNew("");
      setChangePasswordConfirm("");
      setShowChangePassword(false);

      // Password changes require a fresh login.
      setUser(null);
      setToken("");
      setShowProblems(false);
      setShowSubmissions(false);
      setShowProfile(false);
      setShowLeaderboard(false);
      setShowAdmin(false);
      setSelectedProblem(null);
      setSelectedSubmission(null);
      setAuthMode("login");
      setAuthMessage(
        data.message ||
        "Password changed successfully. Please login again with your new password."
      );
      setMessage("");
    } catch {
      setMessage("Could not connect to backend.");
    }

    setChangePasswordLoading(false);
  };

  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEditProfile = async (event) => {
    event.preventDefault();

    if (!user || !token) {
      setAuthMode("login");
      return;
    }

    const username = editUsername.trim();

    if (username.length < 3) {
      setMessage("Username must contain at least 3 characters.");
      return;
    }

    if (username.length > 50) {
      setMessage("Username must contain at most 50 characters.");
      return;
    }

    setEditProfileLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not update profile."
        );
        setEditProfileLoading(false);
        return;
      }

      const updatedUser = data.user || data;

      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        localStorage.setItem("codearena_user", JSON.stringify(updatedUser));
      }

      setEditUsername(updatedUser.username || username);
      setShowEditProfile(false);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Could not connect to backend.");
    }

    setEditProfileLoading(false);
  };

  // =========================================================
  // REQUEST EMAIL CHANGE
  // =========================================================

  const handleRequestEmailChange = async () => {

    if (!user || !token) {
      setAuthMode("login");
      return;
    }

    const newEmail = editEmail.trim().toLowerCase();

    if (!newEmail) {
      setMessage("Please enter your new email address.");
      return;
    }

    if (newEmail === String(user.email || "").trim().toLowerCase()) {
      setMessage("New email must be different from your current email.");
      return;
    }

    setEmailChangeLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/request-email-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            new_email: newEmail
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not request email change."
        );
        return;
      }

      setMessage(
        data.message ||
        "Verification email sent. Please check your new email inbox."
      );
      setEditEmail("");
    } catch {
      setMessage("Could not connect to backend.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (event) => {
    event.preventDefault();

    setAuthMessage("");
    setAuthLoading(true);

    if (authUsername.trim().length < 3) {
      setAuthMessage(
        "Username must contain at least 3 characters."
      );

      setAuthLoading(false);

      return;
    }

    if (authPassword.length < 6) {
      setAuthMessage(
        "Password must contain at least 6 characters."
      );

      setAuthLoading(false);

      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/users`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: authUsername.trim(),
            email: authEmail.trim(),
            password: authPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Registration failed."
        );

        setAuthLoading(false);

        return;
      }

      setAuthMessage(
        "Registration successful! You can now login."
      );

      clearAuthFields();

      setTimeout(() => {
        setAuthMode("login");
        setAuthMessage("");
      }, 1000);

    } catch {
      setAuthMessage(
        "Could not connect to backend."
      );
    }

    setAuthLoading(false);
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setAuthMessage("");
    setAuthLoading(true);

    if (
      !authUsername.trim() ||
      !authPassword
    ) {
      setAuthMessage(
        "Please enter username and password."
      );

      setAuthLoading(false);

      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: authUsername.trim(),
            password: authPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(
          data.detail ||
          "Invalid username or password."
        );

        setAuthLoading(false);

        return;
      }

      setUser(data.user);

      setToken(
        data.token || ""
      );

      clearAuthFields();

      setAuthMessage("");

      setMessage(
        "Login successful!"
      );

    } catch {
      setAuthMessage(
        "Could not connect to backend."
      );
    }

    setAuthLoading(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    setUser(null);

    setToken("");

    setProblems([]);

    setSubmissions([]);

    setLeaderboard([]);

    setShowProblems(false);

    setShowSubmissions(false);

    setShowProfile(false);

    setShowLeaderboard(false);
    setShowAdmin(false);

    setSelectedProblem(null);

    setSelectedSubmission(null);

    setMessage("");

    setAuthMessage("");
  };

  // =========================================================
  // BACKEND CHECK
  // =========================================================

  const checkBackend = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/`
      );

      const data = await response.json();

      setMessage(data.message);

    } catch {
      setMessage(
        "Could not connect to backend"
      );
    }
  };

  // =========================================================
  // VIEW PROBLEMS
  // =========================================================

  const viewProblems = async () => {
    try {
      setMessage(
        "Loading problems..."
      );

      const response = await fetch(
        `${API_BASE}/problems`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error();
      }

      setProblems(data);

      setMessage("");

    } catch {
      setProblems([]);

      setMessage(
        "Could not connect to backend. Problems page is still open."
      );
    }

    setShowProblems(true);

    setShowSubmissions(false);

    setShowProfile(false);

    setShowLeaderboard(false);

    setSelectedProblem(null);

    setSelectedSubmission(null);
  };

  // =========================================================
  // VIEW SUBMISSIONS
  // =========================================================

  const viewSubmissions = async () => {
    if (!user || isPasswordResetRoute) {
      setAuthMode("login");
      return;
    }

    try {
      setMessage(
        "Loading submissions..."
      );

      const problemsResponse =
        await fetch(
          `${API_BASE}/problems`
        );

      const submissionsResponse =
        await fetch(
          `${API_BASE}/users/${user.id}/submissions`,
          {
            headers: authHeaders()
          }
        );

      const problemsData =
        await problemsResponse.json();

      const submissionsData =
        await submissionsResponse.json();

      if (
        !problemsResponse.ok ||
        !submissionsResponse.ok
      ) {
        throw new Error(
          submissionsData.detail ||
          "Submissions failed"
        );
      }

      setProblems(
        problemsData
      );

      setSubmissions(
        submissionsData
      );

      setMessage("");

    } catch (error) {
      setMessage(
        error.message ||
        "Could not connect to backend. Submissions page is still open."
      );
    }

    setShowSubmissions(true);

    setShowProblems(false);

    setShowProfile(false);

    setShowLeaderboard(false);

    setSelectedProblem(null);

    setSelectedSubmission(null);
  };

  // =========================================================
  // VIEW PROFILE
  // =========================================================

  const viewProfile = async () => {
    if (!user) {
      setAuthMode("login");
      return;
    }

    try {
      setMessage(
        "Loading profile..."
      );

      const response =
        await fetch(
          `${API_BASE}/users/${user.id}/submissions`,
          {
            headers: authHeaders()
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Profile failed"
        );
      }

      setSubmissions(data);

      setMessage("");

    } catch (error) {
      setMessage(
        error.message ||
        "Could not connect to backend. Profile page is still open."
      );
    }

    setShowProfile(true);

    setShowProblems(false);

    setShowSubmissions(false);

    setShowLeaderboard(false);

    setSelectedProblem(null);

    setSelectedSubmission(null);
  };

  // =========================================================
  // VIEW LEADERBOARD
  // =========================================================

  const viewLeaderboard = async () => {
    if (!user) {
      setAuthMode("login");
      return;
    }

    try {
      setMessage(
        "Loading leaderboard..."
      );

      const response =
        await fetch(
          `${API_BASE}/leaderboard`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Leaderboard failed"
        );
      }

      setLeaderboard(data);

      setMessage("");

    } catch (error) {
      setLeaderboard([]);

      setMessage(
        error.message ||
        "Could not connect to backend. Leaderboard page is still open."
      );
    }

    setShowLeaderboard(true);

    setShowProblems(false);

    setShowSubmissions(false);

    setShowProfile(false);

    setSelectedProblem(null);

    setSelectedSubmission(null);
  };

  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  const viewAdmin = async () => {
    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    setShowAdmin(true);
    setShowProblems(false);
    setShowSubmissions(false);
    setShowProfile(false);
    setShowLeaderboard(false);
    setSelectedProblem(null);
    setSelectedSubmission(null);
    setAdminSelectedProblem(null);
    setAdminTestCases([]);
    setMessage("");
    setAdminProblemsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/problems`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not load problems."
        );
      }

      setProblems(data);
    } catch (error) {
      setMessage(
        error.message ||
        "Could not load problems for admin management."
      );
    } finally {
      setAdminProblemsLoading(false);
    }
  };

  const createProblem = async (event) => {
    event.preventDefault();

    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          title: adminTitle.trim(),
          description: adminDescription.trim(),
          difficulty: adminDifficulty,
          input_format: adminInputFormat.trim(),
          output_format: adminOutputFormat.trim(),
          constraints: adminConstraints.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not create problem.");
      }

      setMessage(`Problem created successfully: ${data.title || adminTitle}`);

      setAdminTitle("");
      setAdminDescription("");
      setAdminDifficulty("Easy");
      setAdminInputFormat("");
      setAdminOutputFormat("");
      setAdminConstraints("");

      await viewProblems();
      setShowAdmin(true);
      setShowProblems(false);
    } catch (error) {
      setMessage(error.message || "Could not create problem.");
    } finally {
      setAdminLoading(false);
    }
  };

  const createTestCase = async (event) => {
    event.preventDefault();

    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    if (!adminProblemId) {
      setMessage("Enter a problem ID first.");
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/test-cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          problem_id: Number(adminProblemId),
          input_data: adminTestInput,
          expected_output: adminExpectedOutput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not create test case.");
      }

      setMessage("Test case created successfully.");
      setAdminTestInput("");
      setAdminExpectedOutput("");
    } catch (error) {
      setMessage(error.message || "Could not create test case.");
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================================================
  // ADMIN: VIEW TEST CASES FOR A PROBLEM
  // =========================================================

  const viewAdminTestCases = async (problem) => {
    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    setAdminSelectedProblem(problem);
    setAdminTestCases([]);
    setAdminTestCasesLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/problems/${problem.id}/test-cases`,
        {
          headers: {
            ...authHeaders()
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not load test cases."
        );
      }

      setAdminTestCases(data);
    } catch (error) {
      setMessage(
        error.message ||
        "Could not load test cases."
      );
    } finally {
      setAdminTestCasesLoading(false);
    }
  };


  // =========================================================
  // ADMIN: EDIT / DELETE PROBLEMS
  // =========================================================

  const startEditProblem = (problem) => {
    setAdminEditingProblem(problem);
    setAdminEditTitle(problem.title || "");
    setAdminEditDescription(problem.description || "");
    setAdminEditDifficulty(problem.difficulty || "Easy");
    setAdminEditInputFormat(problem.input_format || "");
    setAdminEditOutputFormat(problem.output_format || "");
    setAdminEditConstraints(problem.constraints || "");
    setMessage("");
  };

  const cancelEditProblem = () => {
    setAdminEditingProblem(null);
    setAdminEditTitle("");
    setAdminEditDescription("");
    setAdminEditDifficulty("Easy");
    setAdminEditInputFormat("");
    setAdminEditOutputFormat("");
    setAdminEditConstraints("");
  };

  const updateProblem = async (event) => {
    event.preventDefault();

    if (!user?.is_admin || !adminEditingProblem) {
      setMessage("Admin access required.");
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/problems/${adminEditingProblem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            title: adminEditTitle.trim(),
            description: adminEditDescription.trim(),
            difficulty: adminEditDifficulty,
            input_format: adminEditInputFormat.trim(),
            output_format: adminEditOutputFormat.trim(),
            constraints: adminEditConstraints.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not update problem.");
      }

      const updatedProblem = data.id
        ? data
        : {
            ...adminEditingProblem,
            title: adminEditTitle.trim(),
            description: adminEditDescription.trim(),
            difficulty: adminEditDifficulty,
            input_format: adminEditInputFormat.trim(),
            output_format: adminEditOutputFormat.trim(),
            constraints: adminEditConstraints.trim()
          };

      setProblems((current) =>
        current.map((problem) =>
          problem.id === updatedProblem.id ? updatedProblem : problem
        )
      );

      if (adminSelectedProblem?.id === updatedProblem.id) {
        setAdminSelectedProblem(updatedProblem);
      }

      setMessage(`Problem #${updatedProblem.id} updated successfully.`);
      cancelEditProblem();
    } catch (error) {
      setMessage(error.message || "Could not update problem.");
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteProblem = async (problem) => {
    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    const confirmed = window.confirm(
      `Delete Problem #${problem.id} - ${problem.title}?\
\
This may also affect its test cases and submissions.`
    );

    if (!confirmed) {
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/problems/${problem.id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders()
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Could not delete problem.");
      }

      setProblems((current) =>
        current.filter((item) => item.id !== problem.id)
      );

      if (adminSelectedProblem?.id === problem.id) {
        setAdminSelectedProblem(null);
        setAdminTestCases([]);
      }

      if (adminEditingProblem?.id === problem.id) {
        cancelEditProblem();
      }

      setMessage(`Problem #${problem.id} deleted successfully.`);
    } catch (error) {
      setMessage(error.message || "Could not delete problem.");
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================================================
  // ADMIN: EDIT / DELETE TEST CASES
  // =========================================================

  const startEditTestCase = (testCase) => {
    setAdminEditingTestCase(testCase);
    setAdminEditTestInput(testCase.input_data || "");
    setAdminEditExpectedOutput(testCase.expected_output || "");
    setMessage("");
  };

  const cancelEditTestCase = () => {
    setAdminEditingTestCase(null);
    setAdminEditTestInput("");
    setAdminEditExpectedOutput("");
  };

  const updateTestCase = async (event) => {
    event.preventDefault();

    if (!user?.is_admin || !adminEditingTestCase) {
      setMessage("Admin access required.");
      return;
    }

    if (!adminEditExpectedOutput.trim()) {
      setMessage("Expected output is required to update a test case.");
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/test-cases/${adminEditingTestCase.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            problem_id: adminEditingTestCase.problem_id,
            input_data: adminEditTestInput,
            expected_output: adminEditExpectedOutput
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not update test case.");
      }

      const updatedTestCase = data.id
        ? data
        : {
            ...adminEditingTestCase,
            input_data: adminEditTestInput,
            expected_output: adminEditExpectedOutput
          };

      setAdminTestCases((current) =>
        current.map((testCase) =>
          testCase.id === updatedTestCase.id ? updatedTestCase : testCase
        )
      );

      setMessage(`Test case #${updatedTestCase.id} updated successfully.`);
      cancelEditTestCase();
    } catch (error) {
      setMessage(error.message || "Could not update test case.");
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteTestCase = async (testCase) => {
    if (!user?.is_admin) {
      setMessage("Admin access required.");
      return;
    }

    const confirmed = window.confirm(
      `Delete Test Case #${testCase.id}?`
    );

    if (!confirmed) {
      return;
    }

    setAdminLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/test-cases/${testCase.id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders()
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Could not delete test case.");
      }

      setAdminTestCases((current) =>
        current.filter((item) => item.id !== testCase.id)
      );

      if (adminEditingTestCase?.id === testCase.id) {
        cancelEditTestCase();
      }

      setMessage(`Test case #${testCase.id} deleted successfully.`);
    } catch (error) {
      setMessage(error.message || "Could not delete test case.");
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================================================
  // GET PROBLEM TITLE
  // =========================================================

  const getProblemTitle = (
    problemId
  ) => {
    const problem =
      problems.find(
        (p) =>
          p.id === problemId
      );

    return problem
      ? problem.title
      : `Problem #${problemId}`;
  };

  // =========================================================
  // VERDICT COLOR
  // =========================================================

  const getVerdictColor = (
    verdict
  ) => {
    if (verdict === "Accepted") {
      return "#62df98";
    }

    if (verdict === "Pending") {
      return "#ffcc66";
    }

    return "#ff7b7b";
  };

  // =========================================================
  // VERDICT SYMBOL
  // =========================================================

  const getVerdictSymbol = (
    verdict
  ) => {
    if (verdict === "Accepted") {
      return "✓";
    }

    if (verdict === "Pending") {
      return "●";
    }

    return "✕";
  };

  // =========================================================
  // SUBMISSION DETAILS
  // =========================================================

  const viewSubmissionDetails =
    async (
      submissionId
    ) => {
      try {
        setMessage(
          "Loading submission..."
        );

        const response =
          await fetch(
            `${API_BASE}/submissions/${submissionId}`,
            {
              headers: authHeaders()
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.detail ||
            "Could not load submission"
          );

          return;
        }

        setSelectedSubmission(
          data
        );

        setShowSubmissions(false);

        setShowProfile(false);

        setShowProblems(false);

        setShowLeaderboard(false);

        setMessage("");

      } catch {
        setMessage(
          "Could not connect to backend"
        );
      }
    };

  // =========================================================
  // SOLVE PROBLEM
  // =========================================================

  const solveProblem = (
    problem
  ) => {
    setSelectedProblem(
      problem
    );

    setShowProblems(false);

    setShowSubmissions(false);

    setShowProfile(false);

    setShowLeaderboard(false);

    setSelectedSubmission(null);

    const templates =
      getProblemTemplates(
        problem
      );

    setLanguage(
      "python"
    );

    setCode(
      templates.python
    );

    setMessage("");
  };

  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================

  const changeLanguage = (
    newLanguage
  ) => {
    setLanguage(
      newLanguage
    );

    if (selectedProblem) {
      const templates =
        getProblemTemplates(
          selectedProblem
        );

      if (
        newLanguage === "python"
      ) {
        setCode(
          templates.python
        );
      } else {
        setCode(
          templates.cpp
        );
      }
    }

    setMessage("");
  };

  // =========================================================
  // SUBMIT CODE
  // =========================================================

  const submitCode =
    async () => {
      if (
        !selectedProblem ||
        !user
      ) {
        return;
      }

      try {
        setMessage(
          "Submitting..."
        );

        const response =
          await fetch(
            `${API_BASE}/submissions`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...authHeaders()
              },

              body: JSON.stringify({
                user_id:
                  user.id,

                problem_id:
                  selectedProblem.id,

                code:
                  code,

                language:
                  language
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.detail ||
            "Submission failed"
          );

          return;
        }

        setMessage(
          `Verdict: ${data.verdict}`
        );

      } catch {
        setMessage(
          "Could not connect to backend"
        );
      }
    };

  // =========================================================
  // PROFILE STATISTICS
  // =========================================================

  const totalSubmissions =
    submissions.length;

  const acceptedCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Accepted"
    ).length;

  const wrongAnswerCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Wrong Answer"
    ).length;

  const runtimeErrorCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Runtime Error"
    ).length;

  const compilationErrorCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Compilation Error"
    ).length;

  const timeLimitCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Time Limit Exceeded"
    ).length;

  const pendingCount =
    submissions.filter(
      (submission) =>
        submission.verdict ===
        "Pending"
    ).length;

  const solvedProblemIds =
    new Set(
      submissions
        .filter(
          (submission) =>
            submission.verdict ===
            "Accepted"
        )
        .map(
          (submission) =>
            submission.problem_id
        )
    );

  const solvedProblems =
    solvedProblemIds.size;

  const successRate =
    totalSubmissions > 0
      ? Math.round(
          (
            acceptedCount /
            totalSubmissions
          ) * 100
        )
      : 0;

  // =========================================================
  // FILTERED PROBLEMS
  // =========================================================

  const filteredProblems = problems.filter((problem) => {
    const searchText = problemSearch.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      String(problem.title || "")
        .toLowerCase()
        .includes(searchText) ||
      String(problem.description || "")
        .toLowerCase()
        .includes(searchText) ||
      String(problem.id || "")
        .includes(searchText);

    const matchesDifficulty =
      problemDifficultyFilter === "All" ||
      String(problem.difficulty || "").toLowerCase() ===
        problemDifficultyFilter.toLowerCase();

    return matchesSearch && matchesDifficulty;
  });

  const adminInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#080d1d",
    color: "#fff",
    fontSize: "14px"
  };

  const adminTextareaStyle = {
    ...adminInputStyle,
    minHeight: "90px",
    resize: "vertical"
  };

  // =========================================================
  // EMAIL VERIFICATION SCREEN
  // =========================================================

  if (isEmailVerificationRoute) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            CodeArena
          </div>
        </nav>

        <main
          style={{
            minHeight: "calc(100vh - 70px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px"
          }}
        >
          <div
            className="problem-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              display: "block",
              padding: "40px",
              textAlign: "center"
            }}
          >
            <p className="tag">
              CODEARENA
            </p>

            <h2 style={{ marginBottom: "12px" }}>
              {emailVerificationLoading
                ? "Verifying Email..."
                : emailVerificationSuccess
                ? "Email Verified"
                : "Email Verification Failed"}
            </h2>

            <p
              className="description"
              style={{ marginBottom: "25px" }}
            >
              {emailVerificationLoading
                ? "Please wait while we verify your email change request."
                : emailVerificationMessage}
            </p>

            {emailVerificationSuccess && (
              <div
                className="backend-status"
                style={{ marginBottom: "20px" }}
              >
                Your CodeArena account email has been updated successfully.
              </div>
            )}

            {!emailVerificationLoading && (
              <button
                className="primary-button"
                onClick={finishEmailVerification}
              >
                {user ? "Continue to CodeArena" : "Back to Login"}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // AUTH SCREEN
  // =========================================================

  if (!user) {
    const isForgotMode = authMode === "forgot";
    const isResetMode = authMode === "reset";

    const authTitle =
      authMode === "login"
        ? "Welcome Back"
        : authMode === "register"
        ? "Create Account"
        : authMode === "forgot"
        ? "Forgot Password"
        : "Reset Password";

    const authDescription =
      authMode === "login"
        ? "Login to continue coding."
        : authMode === "register"
        ? "Create your CodeArena account."
        : authMode === "forgot"
        ? "Enter your registered email to reset your password."
        : "Create a new password for your CodeArena account.";

    const handleBackToLogin = () => {
      setAuthMode("login");
      setAuthMessage("");
      setResetToken("");
      setResetPassword("");
      setResetConfirmPassword("");

      if (isPasswordResetRoute) {
        window.history.replaceState(
          {},
          document.title,
          "/"
        );
        setIsPasswordResetRoute(false);
      }
    };

    return (
      <div className="app">

        <nav className="navbar">

          <div className="logo">
            CodeArena
          </div>

          <div className="nav-links">

            <span
              onClick={() => {
                setAuthMode("login");
                setAuthMessage("");
              }}
              style={{
                cursor: "pointer"
              }}
            >
              Login
            </span>

            <span
              onClick={() => {
                setAuthMode("register");
                setAuthMessage("");
              }}
              style={{
                cursor: "pointer"
              }}
            >
              Register
            </span>

          </div>

        </nav>

        <main
          style={{
            minHeight:
              "calc(100vh - 70px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px"
          }}
        >

          <div
            className="problem-card"
            style={{
              width: "100%",
              maxWidth: "480px",
              display: "block",
              padding: "40px"
            }}
          >

            <p
              className="tag"
              style={{
                textAlign: "center"
              }}
            >
              CODEARENA
            </p>

            <h2
              style={{
                textAlign: "center",
                fontSize: "38px",
                marginBottom: "10px"
              }}
            >
              {authTitle}
            </h2>

            <p
              className="description"
              style={{
                textAlign: "center",
                marginBottom: "30px"
              }}
            >
              {authDescription}
            </p>

            {isForgotMode && (
              <form onSubmit={handleForgotPassword}>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    autoComplete="email"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                {authMessage && (
                  <div
                    className="backend-status"
                    style={{ marginBottom: "20px" }}
                  >
                    {authMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading}
                  style={{
                    width: "100%",
                    padding: "14px"
                  }}
                >
                  {authLoading ? "Please wait..." : "Send Reset Request"}
                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <span
                    onClick={handleBackToLogin}
                    style={{
                      color: "#62a0ff",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Back to Login
                  </span>
                </div>

              </form>
            )}

            {isResetMode && (
              <form onSubmit={handleResetPassword}>

                {!isPasswordResetRoute && (
                  <div style={{ marginBottom: "18px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600"
                      }}
                    >
                      Reset Token
                    </label>

                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token"
                      required
                      autoComplete="off"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#080d1d",
                        color: "#fff",
                        fontSize: "15px"
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    New Password
                  </label>

                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                {authMessage && (
                  <div
                    className="backend-status"
                    style={{ marginBottom: "20px" }}
                  >
                    {authMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading}
                  style={{
                    width: "100%",
                    padding: "14px"
                  }}
                >
                  {authLoading ? "Please wait..." : "Reset Password"}
                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <span
                    onClick={handleBackToLogin}
                    style={{
                      color: "#62a0ff",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Back to Login
                  </span>
                </div>

              </form>
            )}

            {(authMode === "login" || authMode === "register") && (
              <>
                <form
                  onSubmit={
                    authMode === "login"
                      ? handleLogin
                      : handleRegister
                  }
                >

                  <div style={{ marginBottom: "18px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600"
                      }}
                    >
                      Username
                    </label>

                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      autoComplete="username"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#080d1d",
                        color: "#fff",
                        fontSize: "15px"
                      }}
                    />
                  </div>

                  {authMode === "register" && (
                    <div style={{ marginBottom: "18px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600"
                        }}
                      >
                        Email
                      </label>

                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                        autoComplete="email"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "14px",
                          borderRadius: "8px",
                          border: "1px solid #334155",
                          background: "#080d1d",
                          color: "#fff",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600"
                      }}
                    >
                      Password
                    </label>

                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      minLength={6}
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#080d1d",
                        color: "#fff",
                        fontSize: "15px"
                      }}
                    />
                  </div>

                  {authMessage && (
                    <div
                      className="backend-status"
                      style={{ marginBottom: "20px" }}
                    >
                      {authMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={authLoading}
                    style={{
                      width: "100%",
                      padding: "14px"
                    }}
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Login"
                      : "Create Account"}
                  </button>

                </form>

                {authMode === "login" && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "18px"
                    }}
                  >
                    <span
                      onClick={() => {
                        setAuthMode("forgot");
                        setAuthMessage("");
                        setResetEmail("");
                      }}
                      style={{
                        color: "#62a0ff",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Forgot your password?
                    </span>
                  </div>
                )}

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "25px"
                  }}
                >
                  {authMode === "login" ? (
                    <p>
                      Don't have an account?{" "}
                      <span
                        onClick={() => {
                          setAuthMode("register");
                          setAuthMessage("");
                        }}
                        style={{
                          color: "#62a0ff",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Register
                      </span>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <span
                        onClick={() => {
                          setAuthMode("login");
                          setAuthMessage("");
                        }}
                        style={{
                          color: "#62a0ff",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Login
                      </span>
                    </p>
                  )}
                </div>
              </>
            )}

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          CodeArena
        </div>

        <div className="nav-links">

          <span
            onClick={viewProblems}
            style={{
              cursor: "pointer"
            }}
          >
            Problems
          </span>

          <span
            onClick={viewSubmissions}
            style={{
              cursor: "pointer"
            }}
          >
            Submissions
          </span>

          <span
            onClick={viewLeaderboard}
            style={{
              cursor: "pointer"
            }}
          >
            Leaderboard
          </span>

          {user.is_admin && (
            <span
              onClick={viewAdmin}
              style={{
                cursor: "pointer",
                color: "#62a0ff"
              }}
            >
              Admin
            </span>
          )}

          <span
            onClick={viewProfile}
            style={{
              cursor: "pointer"
            }}
          >
            Profile
          </span>

          <span
            onClick={logout}
            style={{
              cursor: "pointer",
              color: "#ff7b7b"
            }}
          >
            Logout
          </span>

        </div>

      </nav>

      {/* HOME */}

      {!showProblems &&
        !showSubmissions &&
        !showProfile &&
        !showLeaderboard &&
        !showAdmin &&
        !selectedProblem &&
        !selectedSubmission && (

        <main className="hero">

          <div className="hero-content">

            <p className="tag">
              ONLINE JUDGE PLATFORM
            </p>

            <h1>
              Code.
              <br />

              <span>
                Compete.
              </span>

              <br />

              Improve.
            </h1>

            <p className="description">

              Welcome,{" "}

              <strong>
                {user.username}
              </strong>

              .

              <br />

              Practice programming
              problems, submit your
              solutions, and get
              instant verdicts.

            </p>

            <div className="buttons">

              <button
                className="primary-button"
                onClick={
                  viewProblems
                }
              >
                View Problems
              </button>

              <button
                className="secondary-button"
                onClick={
                  checkBackend
                }
              >
                Check Backend
              </button>

            </div>

            {message && (

              <div className="backend-status">
                {message}
              </div>

            )}

          </div>

          <div className="hero-card">

            <div className="card-header">

              <span>
                CodeArena
              </span>

              <span className="status">
                ● ONLINE
              </span>

            </div>

            <div className="code-window">

              <div>
                <span className="line-number">
                  1
                </span>

                <span>
                  #include &lt;iostream&gt;
                </span>
              </div>

              <div>
                <span className="line-number">
                  2
                </span>

                <span>
                  using namespace std;
                </span>
              </div>

              <div>
                <span className="line-number">
                  3
                </span>

                <span>
                  &nbsp;
                </span>
              </div>

              <div>
                <span className="line-number">
                  4
                </span>

                <span>
                  int main() {"{"}
                </span>
              </div>

              <div>
                <span className="line-number">
                  5
                </span>

                <span>
                  &nbsp;&nbsp;cout &lt;&lt;
                  "Hello CodeArena";
                </span>
              </div>

              <div>
                <span className="line-number">
                  6
                </span>

                <span>
                  {"}"}
                </span>
              </div>

            </div>

            <div className="verdict">
              <span>
                ✓
              </span>

              Accepted
            </div>

          </div>

          {/* =====================================================
              HOME FEATURE CARDS
          ===================================================== */}

          <section className="home-features" aria-label="CodeArena features">

            <button
              type="button"
              className="feature-card feature-card-purple"
              onClick={viewProblems}
            >
              <div className="feature-icon">&lt;/&gt;</div>

              <div className="feature-card-content">
                <h3>Solve Problems</h3>
                <p>
                  Explore a variety of coding problems across different
                  difficulty levels.
                </p>
              </div>

              <span className="feature-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              className="feature-card feature-card-green"
              onClick={viewSubmissions}
            >
              <div className="feature-icon">⚡</div>

              <div className="feature-card-content">
                <h3>Instant Feedback</h3>
                <p>
                  Get immediate feedback on your code submissions with
                  detailed results.
                </p>
              </div>

              <span className="feature-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              className="feature-card feature-card-gold"
              onClick={viewLeaderboard}
            >
              <div className="feature-icon">🏆</div>

              <div className="feature-card-content">
                <h3>Compete &amp; Rank</h3>
                <p>
                  Climb the leaderboard and compete with developers
                  worldwide.
                </p>
              </div>

              <span className="feature-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              className="feature-card feature-card-blue"
              onClick={viewProfile}
            >
              <div className="feature-icon">▮▮▮</div>

              <div className="feature-card-content">
                <h3>Track Progress</h3>
                <p>
                  Monitor your improvement and analyze your coding
                  performance.
                </p>
              </div>

              <span className="feature-arrow" aria-hidden="true">
                →
              </span>
            </button>

          </section>

          {/* =====================================================
              HOME STATISTICS
          ===================================================== */}

          <section className="home-stats" aria-label="Your CodeArena statistics">

            <div className="home-stat">
              <div className="stat-icon stat-icon-purple">▤</div>
              <div>
                <span className="stat-label">TOTAL SUBMISSIONS</span>
                <strong>{totalSubmissions}</strong>
                <small>Across all problems</small>
              </div>
            </div>

            <div className="home-stat">
              <div className="stat-icon stat-icon-green">✓</div>
              <div>
                <span className="stat-label">ACCEPTED</span>
                <strong>{acceptedCount}</strong>
                <small>{successRate}% acceptance rate</small>
              </div>
            </div>

            <div className="home-stat">
              <div className="stat-icon stat-icon-blue">&lt;/&gt;</div>
              <div>
                <span className="stat-label">PROBLEMS SOLVED</span>
                <strong>{solvedProblems}</strong>
                <small>Keep it up!</small>
              </div>
            </div>

            <div className="home-stat">
              <div className="stat-icon stat-icon-purple">↗</div>
              <div>
                <span className="stat-label">SUCCESS RATE</span>
                <strong>{successRate}%</strong>
                <small>Your solving rate</small>
              </div>
            </div>

          </section>

        </main>

      )}

      {/* PROBLEMS */}

      {showProblems &&
        !selectedProblem && (

        <main className="problems-page">

          <div className="problems-header">

            <div>

              <p className="tag">
                CODEARENA
              </p>

              <h2>
                Problems
              </h2>

              <p className="description">
                Choose a problem and start coding.
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setShowProblems(
                  false
                );

                setMessage("");
              }}
            >
              Back Home
            </button>

          </div>

          <div
            style={{
              marginBottom: "22px",
              padding: "18px",
              border: "1px solid #263552",
              borderRadius: "12px",
              background: "#101827"
            }}
          >

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >

              <div
                style={{
                  flex: "1 1 280px",
                  minWidth: "240px"
                }}
              >
                <input
                  type="text"
                  value={problemSearch}
                  onChange={(e) =>
                    setProblemSearch(e.target.value)
                  }
                  placeholder="Search problems by title, description, or ID..."
                  aria-label="Search problems"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    background: "#080d1d",
                    color: "#ffffff",
                    outline: "none",
                    fontSize: "14px"
                  }}
                />
              </div>

              <select
                value={problemDifficultyFilter}
                onChange={(e) =>
                  setProblemDifficultyFilter(e.target.value)
                }
                aria-label="Filter problems by difficulty"
                style={{
                  flex: "0 0 170px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  background: "#080d1d",
                  color: "#ffffff",
                  fontSize: "14px"
                }}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setProblemSearch("");
                  setProblemDifficultyFilter("All");
                }}
                disabled={!problemSearch && problemDifficultyFilter === "All"}
                style={{
                  opacity:
                    !problemSearch && problemDifficultyFilter === "All"
                      ? 0.55
                      : 1
                }}
              >
                Clear
              </button>

            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "14px",
                fontSize: "13px",
                color: "#94a3b8"
              }}
            >
              <span>
                Showing <strong style={{ color: "#ffffff" }}>{filteredProblems.length}</strong> of <strong style={{ color: "#ffffff" }}>{problems.length}</strong> problems
              </span>

              <span>
                {solvedProblems} solved
              </span>
            </div>

          </div>

          <div className="problem-list">

            {problems.length === 0 ? (

              <div className="problem-card">

                <div>

                  <h3>
                    No problems
                  </h3>

                  <p className="problem-description">
                    No problem data could be
                    loaded from the backend.
                  </p>

                </div>

              </div>

            ) : (

              filteredProblems.length === 0 ? (

              <div className="problem-card">

                <div>

                  <h3>
                    No matching problems
                  </h3>

                  <p className="problem-description">
                    Try a different search term or difficulty filter.
                  </p>

                </div>

                <div className="problem-right">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setProblemSearch("");
                      setProblemDifficultyFilter("All");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>

              </div>

            ) : (

              filteredProblems.map(
                (problem) => (

                  <div
                    className="problem-card"
                    key={problem.id}
                  >

                    <div>

                      <p className="problem-number">
                        Problem {problem.id}
                      </p>

                      <h3>
                        {problem.title}
                      </h3>

                      <p className="problem-description">
                        {problem.description}
                      </p>

                    </div>

                    <div className="problem-right">

                      <span
                        className="difficulty"
                        style={{
                          marginBottom: "6px"
                        }}
                      >
                        {problem.difficulty}
                      </span>

                      {solvedProblemIds.has(problem.id) && (
                        <span
                          style={{
                            color: "#62df98",
                            fontSize: "12px",
                            fontWeight: 700,
                            marginBottom: "6px"
                          }}
                        >
                          ✓ Solved
                        </span>
                      )}

                      <button
                        className="primary-button"
                        onClick={() =>
                          solveProblem(
                            problem
                          )
                        }
                      >
                        Solve
                      </button>

                    </div>

                  </div>

                )
              )

            ))}

          </div>

        </main>

      )}

      {/* ADMIN DASHBOARD */}

      {showAdmin && (
        <main className="problems-page">
          <div className="problems-header">
            <div>
              <p className="tag">CODEARENA ADMIN</p>
              <h2>Admin Dashboard</h2>
              <p className="description">
                Create coding problems and test cases.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setShowAdmin(false);
                setMessage("");
              }}
            >
              Back Home
            </button>
          </div>

          {message && (
            <div
              className="backend-status"
              style={{ marginBottom: "20px" }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: "20px"
            }}
          >
            <form className="problem-card" onSubmit={createProblem}>
              <div style={{ width: "100%" }}>
                <p className="problem-number">CREATE PROBLEM</p>
                <h3 style={{ marginBottom: "20px" }}>
                  Add New Problem
                </h3>

                <input
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder="Problem title"
                  required
                  style={adminInputStyle}
                />

                <textarea
                  value={adminDescription}
                  onChange={(e) => setAdminDescription(e.target.value)}
                  placeholder="Problem description"
                  required
                  style={adminTextareaStyle}
                />

                <select
                  value={adminDifficulty}
                  onChange={(e) => setAdminDifficulty(e.target.value)}
                  style={adminInputStyle}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <textarea
                  value={adminInputFormat}
                  onChange={(e) => setAdminInputFormat(e.target.value)}
                  placeholder="Input format"
                  style={adminTextareaStyle}
                />

                <textarea
                  value={adminOutputFormat}
                  onChange={(e) => setAdminOutputFormat(e.target.value)}
                  placeholder="Output format"
                  style={adminTextareaStyle}
                />

                <textarea
                  value={adminConstraints}
                  onChange={(e) => setAdminConstraints(e.target.value)}
                  placeholder="Constraints"
                  style={adminTextareaStyle}
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={adminLoading}
                  style={{ width: "100%" }}
                >
                  {adminLoading ? "Creating..." : "Create Problem"}
                </button>
              </div>
            </form>

            <form className="problem-card" onSubmit={createTestCase}>
              <div style={{ width: "100%" }}>
                <p className="problem-number">CREATE TEST CASE</p>
                <h3 style={{ marginBottom: "20px" }}>
                  Add Test Case
                </h3>

                <input
                  type="number"
                  min="1"
                  value={adminProblemId}
                  onChange={(e) => setAdminProblemId(e.target.value)}
                  placeholder="Problem ID"
                  required
                  style={adminInputStyle}
                />

                <textarea
                  value={adminTestInput}
                  onChange={(e) => setAdminTestInput(e.target.value)}
                  placeholder="Test case input"
                  required
                  style={adminTextareaStyle}
                />

                <textarea
                  value={adminExpectedOutput}
                  onChange={(e) => setAdminExpectedOutput(e.target.value)}
                  placeholder="Expected output"
                  required
                  style={adminTextareaStyle}
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={adminLoading}
                  style={{ width: "100%" }}
                >
                  {adminLoading ? "Creating..." : "Create Test Case"}
                </button>
              </div>
            </form>
          </div>

          {/* EDIT PROBLEM */}
          {adminEditingProblem && (
            <form
              className="problem-card"
              onSubmit={updateProblem}
              style={{ display: "block", marginTop: "25px" }}
            >
              <div style={{ width: "100%" }}>
                <p className="problem-number">
                  EDIT PROBLEM #{adminEditingProblem.id}
                </p>
                <h3 style={{ marginBottom: "20px" }}>Update Problem</h3>

                <input
                  value={adminEditTitle}
                  onChange={(e) => setAdminEditTitle(e.target.value)}
                  placeholder="Problem title"
                  required
                  style={adminInputStyle}
                />

                <textarea
                  value={adminEditDescription}
                  onChange={(e) => setAdminEditDescription(e.target.value)}
                  placeholder="Problem description"
                  required
                  style={adminTextareaStyle}
                />

                <select
                  value={adminEditDifficulty}
                  onChange={(e) => setAdminEditDifficulty(e.target.value)}
                  style={adminInputStyle}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <textarea
                  value={adminEditInputFormat}
                  onChange={(e) => setAdminEditInputFormat(e.target.value)}
                  placeholder="Input format"
                  style={adminTextareaStyle}
                />

                <textarea
                  value={adminEditOutputFormat}
                  onChange={(e) => setAdminEditOutputFormat(e.target.value)}
                  placeholder="Output format"
                  style={adminTextareaStyle}
                />

                <textarea
                  value={adminEditConstraints}
                  onChange={(e) => setAdminEditConstraints(e.target.value)}
                  placeholder="Constraints"
                  style={adminTextareaStyle}
                />

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelEditProblem}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MANAGE EXISTING PROBLEMS */}

          <div
            className="problem-card"
            style={{
              marginTop: "25px",
              display: "block"
            }}
          >
            <div style={{ width: "100%" }}>

              <p className="problem-number">
                PROBLEM MANAGEMENT
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginBottom: "18px"
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "6px" }}>
                    Existing Problems
                  </h3>

                  <p className="problem-description">
                    View your problems and inspect their test-case
                    records.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={adminProblemsLoading}
                  onClick={viewAdmin}
                >
                  {adminProblemsLoading
                    ? "Refreshing..."
                    : "Refresh Problems"}
                </button>
              </div>

              {adminProblemsLoading ? (

                <div
                  style={{
                    padding: "25px",
                    textAlign: "center",
                    color: "#94a3b8"
                  }}
                >
                  Loading problems...
                </div>

              ) : problems.length === 0 ? (

                <div
                  style={{
                    padding: "25px",
                    border: "1px solid #263552",
                    borderRadius: "10px",
                    color: "#94a3b8"
                  }}
                >
                  No problems found.
                </div>

              ) : (

                <div
                  style={{
                    display: "grid",
                    gap: "12px"
                  }}
                >

                  {problems.map((problem) => (

                    <div
                      key={problem.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "15px",
                        padding: "16px",
                        border: "1px solid #263552",
                        borderRadius: "10px",
                        background: "#080d1d",
                        flexWrap: "wrap"
                      }}
                    >

                      <div>
                        <p
                          style={{
                            margin: "0 0 5px",
                            color: "#60a5fa",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          PROBLEM #{problem.id}
                        </p>

                        <h4
                          style={{
                            margin: "0 0 5px",
                            color: "#f8fafc",
                            fontSize: "17px"
                          }}
                        >
                          {problem.title}
                        </h4>

                        <span
                          style={{
                            color:
                              problem.difficulty === "Easy"
                                ? "#62df98"
                                : problem.difficulty === "Medium"
                                ? "#ffcc66"
                                : "#ff7b7b",
                            fontSize: "13px",
                            fontWeight: "700"
                          }}
                        >
                          {problem.difficulty}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => startEditProblem(problem)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            viewAdminTestCases(problem)
                          }
                        >
                          View Test Cases
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => deleteProblem(problem)}
                          style={{ color: "#ff7b7b", borderColor: "#7f1d1d" }}
                        >
                          Delete
                        </button>
                      </div>

                    </div>

                  ))}

                </div>

              )}

              {adminSelectedProblem && (

                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    border: "1px solid #3b82f6",
                    borderRadius: "10px",
                    background: "#101a2d"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                      marginBottom: "15px"
                    }}
                  >

                    <div>
                      <p
                        className="problem-number"
                        style={{ marginBottom: "5px" }}
                      >
                        TEST CASES
                      </p>

                      <h3 style={{ margin: 0 }}>
                        #{adminSelectedProblem.id}{" "}
                        {adminSelectedProblem.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setAdminSelectedProblem(null);
                        setAdminTestCases([]);
                      }}
                    >
                      Close
                    </button>

                  </div>

                  {adminEditingTestCase && (
                    <form
                      onSubmit={updateTestCase}
                      style={{
                        marginBottom: "20px",
                        padding: "18px",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        background: "#080d1d"
                      }}
                    >
                      <p className="problem-number">
                        EDIT TEST CASE #{adminEditingTestCase.id}
                      </p>

                      <textarea
                        value={adminEditTestInput}
                        onChange={(e) => setAdminEditTestInput(e.target.value)}
                        placeholder="Test case input"
                        required
                        style={adminTextareaStyle}
                      />

                      <textarea
                        value={adminEditExpectedOutput}
                        onChange={(e) => setAdminEditExpectedOutput(e.target.value)}
                        placeholder="Expected output"
                        required
                        style={adminTextareaStyle}
                      />

                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button
                          type="submit"
                          className="primary-button"
                          disabled={adminLoading}
                        >
                          {adminLoading ? "Updating..." : "Save Test Case"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditTestCase}
                        >
                          Cancel
                        </button>
                      </div>

                      {!adminEditingTestCase.expected_output && (
                        <p style={{ color: "#ffcc66", fontSize: "12px", marginTop: "12px" }}>
                          The backend listing may hide expected output. Enter the correct expected output before saving.
                        </p>
                      )}
                    </form>
                  )}

                  {adminTestCasesLoading ? (

                    <div
                      style={{
                        padding: "20px",
                        color: "#94a3b8"
                      }}
                    >
                      Loading test cases...
                    </div>

                  ) : adminTestCases.length === 0 ? (

                    <div
                      style={{
                        padding: "20px",
                        border: "1px solid #263552",
                        borderRadius: "8px",
                        color: "#94a3b8"
                      }}
                    >
                      No test cases found for this problem.
                    </div>

                  ) : (

                    <div
                      style={{
                        display: "grid",
                        gap: "10px"
                      }}
                    >

                      {adminTestCases.map((testCase, index) => (

                        <div
                          key={testCase.id}
                          style={{
                            padding: "15px",
                            border: "1px solid #263552",
                            borderRadius: "8px",
                            background: "#080d1d"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "10px"
                            }}
                          >
                            <strong>
                              Test Case #{index + 1}
                            </strong>

                            <span
                              style={{
                                color: "#64748b",
                                fontSize: "12px"
                              }}
                            >
                              ID #{testCase.id}
                            </span>
                          </div>

                          <div>
                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#94a3b8",
                                fontSize: "12px"
                              }}
                            >
                              INPUT
                            </p>

                            <pre
                              style={{
                                margin: 0,
                                padding: "10px",
                                borderRadius: "6px",
                                background: "#050914",
                                color: "#e2e8f0",
                                whiteSpace: "pre-wrap",
                                overflowX: "auto",
                                fontFamily: "Consolas, monospace"
                              }}
                            >
                              {testCase.input_data}
                            </pre>
                          </div>

                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "#64748b",
                              fontSize: "12px"
                            }}
                          >
                            Expected output is protected by the
                            backend and is not exposed by this
                            admin listing endpoint.
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginTop: "12px"
                            }}
                          >
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => startEditTestCase(testCase)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => deleteTestCase(testCase)}
                              style={{ color: "#ff7b7b", borderColor: "#7f1d1d" }}
                            >
                              Delete
                            </button>
                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              )}

            </div>
          </div>
        </main>
      )}

      {/* SUBMISSIONS */}

      {showSubmissions && (

        <main className="problems-page">

          <div className="problems-header">

            <div>

              <p className="tag">
                CODEARENA
              </p>

              <h2>
                Submission History
              </h2>

              <p className="description">
                View your previous code submissions,
                verdicts, test results, and runtime.
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setShowSubmissions(false);
                setMessage("");
              }}
            >
              Back Home
            </button>

          </div>

          {message && (

            <div
              className="backend-status"
              style={{
                marginBottom: "20px"
              }}
            >
              {message}
            </div>

          )}

          {submissions.length === 0 ? (

            <div className="problem-card">

              <div>

                <p className="problem-number">
                  SUBMISSION HISTORY
                </p>

                <h3>
                  No submissions
                </h3>

                <p className="problem-description">
                  No submission data could be loaded.
                  Submit a solution to see it here.
                </p>

              </div>

            </div>

          ) : (

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                border: "1px solid #263552",
                borderRadius: "12px",
                background: "#111827"
              }}
            >

              {/* TABLE HEADER */}

              <div
                style={{
                  minWidth: "900px",
                  display: "grid",
                  gridTemplateColumns:
                    "90px minmax(180px, 1.6fr) 100px 150px 100px 120px",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #263552",
                  background: "#172033",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.05em"
                }}
              >

                <span>
                  ID
                </span>

                <span>
                  PROBLEM
                </span>

                <span>
                  LANGUAGE
                </span>

                <span>
                  VERDICT
                </span>

                <span>
                  TESTS
                </span>

                <span>
                  RUNTIME
                </span>

              </div>

              {/* SUBMISSION ROWS */}

              {submissions.map(
                (submission) => (

                  <div
                    key={submission.id}
                    onClick={() =>
                      viewSubmissionDetails(
                        submission.id
                      )
                    }
                    style={{
                      minWidth: "900px",
                      display: "grid",
                      gridTemplateColumns:
                        "90px minmax(180px, 1.6fr) 100px 150px 100px 120px",
                      alignItems: "center",
                      gap: "12px",
                      padding: "18px 20px",
                      borderBottom:
                        "1px solid #263552",
                      cursor: "pointer",
                      transition:
                        "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "#18243a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "transparent";
                    }}
                  >

                    {/* ID */}

                    <span
                      style={{
                        color: "#60a5fa",
                        fontWeight: "700"
                      }}
                    >
                      #{submission.id}
                    </span>

                    {/* PROBLEM */}

                    <div>

                      <div
                        style={{
                          color: "#f8fafc",
                          fontWeight: "700",
                          marginBottom: "5px"
                        }}
                      >
                        {getProblemTitle(
                          submission.problem_id
                        )}
                      </div>

                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "12px"
                        }}
                      >
                        Click to view submission
                      </div>

                    </div>

                    {/* LANGUAGE */}

                    <span
                      style={{
                        color: "#cbd5e1",
                        fontWeight: "600"
                      }}
                    >
                      {submission.language === "cpp"
                        ? "C++"
                        : "Python"}
                    </span>

                    {/* VERDICT */}

                    <span
                      style={{
                        color:
                          getVerdictColor(
                            submission.verdict
                          ),
                        fontWeight: "700"
                      }}
                    >
                      {getVerdictSymbol(
                        submission.verdict
                      )}{" "}
                      {submission.verdict}
                    </span>

                    {/* TESTS */}

                    <span
                      style={{
                        color: "#e2e8f0",
                        fontWeight: "600"
                      }}
                    >
                      {submission.tests_passed != null &&
                      submission.total_tests != null
                        ? `${submission.tests_passed}/${submission.total_tests}`
                        : "—"}
                    </span>

                    {/* RUNTIME */}

                    <span
                      style={{
                        color: "#cbd5e1",
                        fontSize: "13px"
                      }}
                    >
                      {submission.runtime != null
                        ? `${submission.runtime} ms`
                        : "—"}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

          {/* SUBMISSION COUNT */}

          {submissions.length > 0 && (

            <div
              style={{
                marginTop: "16px",
                color: "#94a3b8",
                fontSize: "13px"
              }}
            >
              Showing{" "}
              <strong
                style={{
                  color: "#e2e8f0"
                }}
              >
                {submissions.length}
              </strong>{" "}
              submission
              {submissions.length === 1
                ? ""
                : "s"}
            </div>

          )}

        </main>

      )}

      {/* LEADERBOARD */}

      {showLeaderboard && (

        <main className="problems-page">

          <div className="problems-header">

            <div>

              <p className="tag">
                CODEARENA
              </p>

              <h2>
                Leaderboard
              </h2>

              <p className="description">
                Compete with other CodeArena users
                and track your coding progress.
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setShowLeaderboard(
                  false
                );

                setMessage("");
              }}
            >
              Back Home
            </button>

          </div>

          {message && (

            <div
              className="backend-status"
              style={{
                marginBottom:
                  "20px"
              }}
            >
              {message}
            </div>

          )}

          <div
            className="problem-card"
            style={{
              overflowX: "auto",
              padding: 0
            }}
          >

            {leaderboard.length === 0 ? (

              <div
                style={{
                  padding: "30px",
                  width: "100%",
                  textAlign: "center"
                }}
              >

                <h3>
                  No leaderboard data
                </h3>

                <p className="problem-description">
                  No users or submissions
                  are available yet.
                </p>

              </div>

            ) : (

              <div
                style={{
                  width: "100%",
                  padding: "24px"
                }}
              >

                {/* =================================================
                    TOP 3 PODIUM
                ================================================== */}

                {leaderboard.length >= 1 && (

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3,minmax(0,1fr))",
                      alignItems: "end",
                      gap: "14px",
                      marginBottom: "30px",
                      maxWidth: "850px",
                      marginLeft: "auto",
                      marginRight: "auto"
                    }}
                  >

                    {[1, 0, 2].map((position) => {

                      const entry = leaderboard[position];

                      if (!entry) {
                        return <div key={position} />;
                      }

                      const isFirst = entry.rank === 1;
                      const isSecond = entry.rank === 2;
                      const isThird = entry.rank === 3;

                      const medal =
                        isFirst
                          ? "👑"
                          : isSecond
                          ? "🥈"
                          : "🥉";

                      const podiumHeight =
                        isFirst
                          ? "235px"
                          : isSecond
                          ? "200px"
                          : "180px";

                      return (

                        <div
                          key={entry.user_id}
                          style={{
                            minHeight: podiumHeight,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "22px 16px",
                            border:
                              isFirst
                                ? "1px solid #ffd166"
                                : isSecond
                                ? "1px solid #cbd5e1"
                                : "1px solid #cd7f32",
                            borderRadius: "16px",
                            background:
                              isFirst
                                ? "linear-gradient(180deg,#242b3d 0%,#151d30 100%)"
                                : "linear-gradient(180deg,#1b2435 0%,#111827 100%)",
                            boxShadow:
                              isFirst
                                ? "0 14px 35px rgba(255,209,102,0.16)"
                                : "0 10px 28px rgba(0,0,0,0.18)",
                            transform:
                              isFirst
                                ? "translateY(-8px)"
                                : "none"
                          }}
                        >

                          <div
                            style={{
                              fontSize: isFirst ? "34px" : "28px",
                              lineHeight: 1
                            }}
                          >
                            {medal}
                          </div>

                          <div
                            style={{
                              width: "68px",
                              height: "68px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                isFirst
                                  ? "#ffd166"
                                  : isSecond
                                  ? "#cbd5e1"
                                  : "#cd7f32",
                              color: "#0b1220",
                              fontSize: "24px",
                              fontWeight: 800,
                              boxShadow:
                                "0 6px 18px rgba(0,0,0,0.25)"
                            }}
                          >
                            {entry.username
                              ? entry.username
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>

                          <div
                            style={{
                              textAlign: "center",
                              width: "100%"
                            }}
                          >
                            <div
                              style={{
                                fontSize: isFirst ? "20px" : "18px",
                                fontWeight: 800,
                                color: "#ffffff",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {entry.username}
                            </div>

                            <div
                              style={{
                                marginTop: "5px",
                                fontSize: "13px",
                                fontWeight: 700,
                                color:
                                  isFirst
                                    ? "#ffd166"
                                    : isSecond
                                    ? "#cbd5e1"
                                    : "#cd7f32"
                              }}
                            >
                              #{entry.rank} · {entry.solved} solved
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                              width: "100%"
                            }}
                          >

                            <div
                              style={{
                                padding: "8px",
                                borderRadius: "8px",
                                background: "#0b1220",
                                textAlign: "center"
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 800,
                                  color: "#ffffff"
                                }}
                              >
                                {entry.accepted}
                              </div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#94a3b8",
                                  marginTop: "2px"
                                }}
                              >
                                ACCEPTED
                              </div>
                            </div>

                            <div
                              style={{
                                padding: "8px",
                                borderRadius: "8px",
                                background: "#0b1220",
                                textAlign: "center"
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 800,
                                  color: "#62df98"
                                }}
                              >
                                {entry.success_rate}%
                              </div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#94a3b8",
                                  marginTop: "2px"
                                }}
                              >
                                SUCCESS
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

                {/* =================================================
                    OTHER RANKINGS
                ================================================== */}

                {leaderboard.length > 3 && (

                  <div
                    style={{
                      border: "1px solid #263552",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "#0f172a"
                    }}
                  >

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "70px minmax(150px,1fr) 90px 100px 120px 110px",
                        gap: "10px",
                        alignItems: "center",
                        padding: "15px 18px",
                        borderBottom: "1px solid #263552",
                        color: "#94a3b8",
                        fontSize: "12px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      <span>Rank</span>
                      <span>User</span>
                      <span>Solved</span>
                      <span>Accepted</span>
                      <span>Submissions</span>
                      <span>Success Rate</span>
                    </div>

                    {leaderboard.slice(3).map(
                      (entry) => (

                        <div
                          key={entry.user_id}
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "70px minmax(150px,1fr) 90px 100px 120px 110px",
                            gap: "10px",
                            alignItems: "center",
                            padding: "16px 18px",
                            borderBottom: "1px solid #1e293b"
                          }}
                        >

                          <strong
                            style={{
                              color: "#cbd5e1"
                            }}
                          >
                            #{entry.rank}
                          </strong>

                          <strong
                            style={{
                              color: "#ffffff",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {entry.username}
                          </strong>

                          <span>{entry.solved}</span>
                          <span>{entry.accepted}</span>
                          <span>{entry.submissions}</span>

                          <span
                            style={{
                              color: "#62df98",
                              fontWeight: 700
                            }}
                          >
                            {entry.success_rate}%
                          </span>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            )}

          </div>

        </main>

      )}

      {/* PROFILE */}

      {showProfile && (

        <main className="problems-page">

          <div className="problems-header">

            <div>

              <p className="tag">
                CODEARENA
              </p>

              <h2>
                Profile
              </h2>

              <p className="description">
                Your programming statistics
                and submission activity.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "flex-end"
              }}
            >
              <button
                className="primary-button"
                onClick={() => {
                  setEditUsername(user.username || "");
                  setEditEmail("");
                  setShowEditProfile(true);
                  setShowChangePassword(false);
                  setMessage("");
                }}
              >
                Edit Profile
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  setShowChangePassword(true);
                  setShowEditProfile(false);
                  setMessage("");
                  setChangePasswordCurrent("");
                  setChangePasswordNew("");
                  setChangePasswordConfirm("");
                }}
              >
                Change Password
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  setShowProfile(false);
                  setShowChangePassword(false);
                  setMessage("");
                }}
              >
                Back Home
              </button>
            </div>

          </div>

          {showEditProfile && (
            <form
              className="problem-card"
              onSubmit={handleEditProfile}
              style={{
                marginBottom: "25px",
                display: "block"
              }}
            >
              <div style={{ width: "100%" }}>
                <p className="problem-number">ACCOUNT SETTINGS</p>

                <h3 style={{ marginBottom: "8px" }}>
                  Edit Profile
                </h3>

                <p
                  className="problem-description"
                  style={{ marginBottom: "22px" }}
                >
                  Update your username or request an email address change. Email changes require verification from the new email inbox.
                </p>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    minLength={3}
                    maxLength={50}
                    autoComplete="username"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                  <p style={{ color: "#64748b", fontSize: "12px", marginTop: "7px" }}>
                    3–50 characters
                  </p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #263552",
                      background: "#111827",
                      color: "#94a3b8",
                      fontSize: "15px",
                      cursor: "not-allowed"
                    }}
                  />
                </div>

                <div
                  style={{
                    borderTop: "1px solid #263552",
                    paddingTop: "22px",
                    marginTop: "4px",
                    marginBottom: "22px"
                  }}
                >
                  <p className="problem-number">EMAIL SECURITY</p>

                  <h4 style={{ marginBottom: "8px" }}>
                    Change Email Address
                  </h4>

                  <p
                    className="problem-description"
                    style={{ marginBottom: "18px" }}
                  >
                    Enter a new email address. We will send a verification link to that address before changing your account email.
                  </p>

                  <div>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter new email address"
                      autoComplete="email"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#080d1d",
                        color: "#fff",
                        fontSize: "15px",
                        marginBottom: "12px"
                      }}
                    />

                    <button
                      type="button"
                      className="secondary-button"
                      disabled={emailChangeLoading}
                      onClick={handleRequestEmailChange}
                    >
                      {emailChangeLoading
                        ? "Sending..."
                        : "Send Verification Email"}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="backend-status" style={{ marginBottom: "20px" }}>
                    {message}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={editProfileLoading}
                  >
                    {editProfileLoading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setShowEditProfile(false);
                      setEditUsername(user.username || "");
                      setEditEmail("");
                      setMessage("");
                    }}
                    disabled={editProfileLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {showChangePassword && (
            <form
              className="problem-card"
              onSubmit={handleChangePassword}
              style={{
                marginBottom: "25px",
                display: "block"
              }}
            >
              <div style={{ width: "100%" }}>
                <p className="problem-number">ACCOUNT SECURITY</p>

                <h3 style={{ marginBottom: "8px" }}>
                  Change Password
                </h3>

                <p
                  className="problem-description"
                  style={{ marginBottom: "22px" }}
                >
                  Enter your current password and choose a new password.
                </p>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordCurrent}
                    onChange={(e) => setChangePasswordCurrent(e.target.value)}
                    placeholder="Enter current password"
                    required
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordNew}
                    onChange={(e) => setChangePasswordNew(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordConfirm}
                    onChange={(e) => setChangePasswordConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "#080d1d",
                      color: "#fff",
                      fontSize: "15px"
                    }}
                  />
                </div>

                {message && (
                  <div
                    className="backend-status"
                    style={{ marginBottom: "20px" }}
                  >
                    {message}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={changePasswordLoading}
                  >
                    {changePasswordLoading
                      ? "Changing..."
                      : "Change Password"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setChangePasswordCurrent("");
                      setChangePasswordNew("");
                      setChangePasswordConfirm("");
                      setMessage("");
                    }}
                    disabled={changePasswordLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div
            className="problem-card"
            style={{
              marginBottom:
                "25px"
            }}
          >

            <div>

              <p className="problem-number">
                CODEARENA USER
              </p>

              <h3>
                {user.username}
              </h3>

              <p className="problem-description">
                {user.email}
              </p>

            </div>

            <div
              style={{
                fontSize: "42px",
                fontWeight: 700,
                color: "#62df98"
              }}
            >
              {successRate}%
            </div>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: "18px",
              marginBottom:
                "25px"
            }}
          >

            <div className="problem-card">

              <div>

                <p className="problem-number">
                  TOTAL SUBMISSIONS
                </p>

                <h3>
                  {totalSubmissions}
                </h3>

              </div>

            </div>

            <div className="problem-card">

              <div>

                <p className="problem-number">
                  ACCEPTED
                </p>

                <h3
                  style={{
                    color:
                      "#62df98"
                  }}
                >
                  {acceptedCount}
                </h3>

              </div>

            </div>

            <div className="problem-card">

              <div>

                <p className="problem-number">
                  PROBLEMS SOLVED
                </p>

                <h3>
                  {solvedProblems}
                </h3>

              </div>

            </div>

            <div className="problem-card">

              <div>

                <p className="problem-number">
                  SUCCESS RATE
                </p>

                <h3>
                  {successRate}%
                </h3>

              </div>

            </div>

          </div>

          <div className="problem-card">

            <div
              style={{
                width: "100%"
              }}
            >

              <p className="problem-number">
                VERDICT BREAKDOWN
              </p>

              <h3>
                Submission Results
              </h3>

              <div
                style={{
                  marginTop: "25px",
                  display: "grid",
                  gap: "16px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#62df98"
                    }}
                  >
                    ✓ Accepted
                  </span>

                  <strong>
                    {acceptedCount}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#ff7b7b"
                    }}
                  >
                    ✕ Wrong Answer
                  </span>

                  <strong>
                    {wrongAnswerCount}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#ff7b7b"
                    }}
                  >
                    ✕ Runtime Error
                  </span>

                  <strong>
                    {runtimeErrorCount}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#ff7b7b"
                    }}
                  >
                    ✕ Compilation Error
                  </span>

                  <strong>
                    {compilationErrorCount}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#ff7b7b"
                    }}
                  >
                    ✕ Time Limit Exceeded
                  </span>

                  <strong>
                    {timeLimitCount}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center"
                  }}
                >

                  <span
                    style={{
                      color:
                        "#ffcc66"
                    }}
                  >
                    ● Pending
                  </span>

                  <strong>
                    {pendingCount}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </main>

      )}

      {/* SUBMISSION DETAILS */}

      {selectedSubmission && (
        <main
          className="solve-page"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            paddingBottom: "60px"
          }}
        >

          <div
            className="solve-header"
            style={{
              marginBottom: "25px"
            }}
          >

            <div>

              <p className="problem-number">
                Submission #{selectedSubmission.id}
              </p>

              <h2>
                {getProblemTitle(selectedSubmission.problem_id)}
              </h2>

              <p className="solve-description">
                Your submitted solution
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setSelectedSubmission(null);
                setShowSubmissions(true);
                setMessage("");
              }}
            >
              Back to Submissions
            </button>

          </div>

          {/* SUBMISSION RESULT */}

          <div
            className="problem-card"
            style={{
              marginBottom: "25px",
              display: "block",
              width: "100%",
              boxSizing: "border-box"
            }}
          >

            <div style={{ width: "100%" }}>

              <p className="problem-number">
                SUBMISSION RESULT
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginTop: "15px"
                }}
              >

                <div>

                  <h3
                    style={{
                      margin: 0,
                      color: getVerdictColor(selectedSubmission.verdict)
                    }}
                  >
                    {getVerdictSymbol(selectedSubmission.verdict)}{" "}
                    {selectedSubmission.verdict}
                  </h3>

                  <p
                    className="problem-description"
                    style={{ marginTop: "8px" }}
                  >
                    Language: {selectedSubmission.language === "cpp" ? "C++" : "Python"}
                  </p>

                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
                    gap: "12px",
                    minWidth: "360px",
                    maxWidth: "100%"
                  }}
                >

                  <div
                    style={{
                      padding: "16px",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      textAlign: "center",
                      background: "#080d1d"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginBottom: "6px"
                      }}
                    >
                      TESTS PASSED
                    </div>
                    <strong style={{ fontSize: "22px" }}>
                      {selectedSubmission.tests_passed ?? 0}/{selectedSubmission.total_tests ?? 0}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      textAlign: "center",
                      background: "#080d1d"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginBottom: "6px"
                      }}
                    >
                      RUNTIME
                    </div>
                    <strong style={{ fontSize: "22px" }}>
                      {selectedSubmission.runtime != null
                        ? `${selectedSubmission.runtime} ms`
                        : "N/A"}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      textAlign: "center",
                      background: "#080d1d"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginBottom: "6px"
                      }}
                    >
                      STATUS
                    </div>
                    <strong
                      style={{
                        fontSize: "18px",
                        color: getVerdictColor(selectedSubmission.verdict)
                      }}
                    >
                      {selectedSubmission.verdict}
                    </strong>
                  </div>

                </div>

              </div>

              <p
                style={{
                  marginTop: "18px",
                  color: "#94a3b8",
                  fontSize: "13px"
                }}
              >
                Submitted: {selectedSubmission.submitted_at
                  ? new Date(selectedSubmission.submitted_at).toLocaleString()
                  : "N/A"}
              </p>

            </div>

          </div>

          {/* SUBMITTED CODE */}

          <div
            className="editor-container"
            style={{
              overflow: "hidden"
            }}
          >

            <div className="editor-header">

              <span>
                Submitted Code
              </span>

              <span>
                {selectedSubmission.language === "cpp" ? "C++" : "Python"}
              </span>

            </div>

            <div
              style={{
                background: "#080d1d",
                minHeight: "450px",
                overflow: "auto",
                padding: "30px"
              }}
            >

              <pre
                style={{
                  margin: 0,
                  color: "#e5e7eb",
                  fontSize: "15px",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "Consolas, monospace"
                }}
              >
                {selectedSubmission.code}
              </pre>

            </div>

          </div>

        </main>
      )}

      {/* SOLVE PAGE */}

      {selectedProblem && (

        <main
          className="solve-page"
        >

          <div
            className="solve-header"
          >

            <div>

              <p className="problem-number">
                Problem{" "}
                {
                  selectedProblem.id
                }
              </p>

              <h2>
                {
                  selectedProblem.title
                }
              </h2>

              <p className="solve-description">
                {
                  selectedProblem.description
                }
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setSelectedProblem(
                  null
                );

                setShowProblems(
                  true
                );

                setMessage("");
              }}
            >
              Back to Problems
            </button>

          </div>

          <div
            className="editor-container"
          >

            <div
              className="editor-header"
            >

              <span>
                Code Editor
              </span>

              <select
                value={language}
                onChange={(e) =>
                  changeLanguage(
                    e.target.value
                  )
                }
              >

                <option value="python">
                  Python
                </option>

                <option value="cpp">
                  C++
                </option>

              </select>

            </div>

            <textarea
              className="code-editor"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                )
              }
              spellCheck="false"
            />

            <div
              className="submit-area"
            >

              {message && (

                <div
                  className="backend-status"
                >
                  {message}
                </div>

              )}

              <button
                className="primary-button"
                onClick={
                  submitCode
                }
              >
                Submit Solution
              </button>

            </div>

          </div>

        </main>

      )}

    </div>
  );
}

export default App;