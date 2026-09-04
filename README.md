# CodeArena

> A full-stack online coding judge platform for solving programming problems, executing submissions, evaluating test cases, and tracking competitive programming progress.

CodeArena provides a complete coding-platform workflow: users can create accounts, solve problems, submit C++17 or Python solutions, receive detailed execution verdicts, review submission history, and compete through a leaderboard.

---

## 🚀 Features

### Authentication & Accounts

- User registration and login
- JWT-based authentication
- Password reset through email
- Password change
- Profile management
- Email change verification

### Problem Solving

- Browse programming problems
- Search and filter problems by difficulty
- View problem descriptions and test cases
- Submit solutions using C++17 or Python
- Track solved problems and progress

### Online Judge

CodeArena evaluates submitted programs and returns verdicts including:

- ✅ Accepted
- ❌ Wrong Answer
- ⚠️ Runtime Error
- 🔴 Compilation Error
- ⏱️ Time Limit Exceeded

The execution system also handles:

- Execution time limits
- Code size limits
- Input size limits
- Output size limits
- Temporary workspace creation and cleanup
- C++17 compilation using `g++`
- Python program execution

### Submissions & Competition

- Submission history
- Submission statistics
- Problem-solving progress
- Competitive leaderboard
- User rankings

### Developer Experience

- FastAPI REST API
- Interactive Swagger API documentation
- Environment-based configuration
- Docker configuration for backend packaging
- Production frontend build support
- Automated executor test suite

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│    React Frontend    │
│      Vite + CSS      │
└──────────┬───────────┘
           │ HTTP / REST API
           ▼
┌──────────────────────┐
│    FastAPI Backend   │
│ Authentication       │
│ Problems             │
│ Submissions          │
│ Leaderboard          │
└───────┬──────────────┘
        │
        ├──────────────────┐
        ▼                  ▼
┌───────────────┐   ┌─────────────────────┐
│ PostgreSQL    │   │   Judge Executor    │
│               │   │                     │
│ Users         │   │ Python execution    │
│ Problems      │   │ C++17 compilation   │
│ Test Cases    │   │ Time limits         │
│ Submissions   │   │ Size limits         │
└───────────────┘   │ Workspace cleanup   │
                    └─────────────────────┘
```

---

## 🔄 Submission Flow

```text
User writes code
       │
       ▼
React Frontend
       │
       │ POST submission
       ▼
FastAPI Backend
       │
       ▼
Load problem + test cases
       │
       ▼
Judge Executor
       │
       ├── C++17 → Compile → Execute
       │
       └── Python → Execute
       │
       ▼
Capture output / errors / timeout
       │
       ▼
Compare program output
       │
       ▼
Generate verdict
       │
       ▼
Store submission in PostgreSQL
       │
       ▼
Return result to frontend
```

---

## 🛡️ Execution Controls

Code execution is handled through temporary workspaces and controlled subprocess execution.

The executor includes protections such as:

- Process timeout handling
- Maximum code size
- Maximum input size
- Maximum output size
- Compilation error handling
- Runtime error handling
- Temporary workspace cleanup
- Unsupported-language validation

> **Note:** The current executor is designed for this project/demo environment and should not be considered a production-grade security sandbox for executing arbitrary untrusted code at Internet scale.

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT-based authentication

### Database

- PostgreSQL

### Code Execution

- Python
- C++17
- `g++`
- Temporary execution workspaces
- Process timeout handling
- Input/output/code size restrictions

### Development & Tooling

- Git
- GitHub
- Docker configuration
- FastAPI Swagger / OpenAPI

---

## 📁 Project Structure

```text
CodeArena/
│
├── backend/
│   ├── database.py
│   ├── executor.py
│   ├── leaderboard.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   ├── test_executor.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/abhiram-naik/CodeArena.git
cd CodeArena
```

### 2. Backend setup

Create and activate a Python virtual environment:

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file from the provided example:

```text
.env.example → .env
```

Configure the required database, authentication, and email environment variables in `.env`.

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide the frontend URL in the terminal.

For local development, the frontend can use:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🧪 Testing

The backend execution engine includes automated tests covering:

- Python correct execution
- C++ correct execution
- Python runtime errors
- C++ compilation errors
- Python time limits
- C++ time limits
- Output size limits
- Code size limits
- Input size limits
- Unsupported languages
- Python input handling
- C++ input handling

The executor test suite currently passes all implemented execution tests.

Run:

```bash
cd backend
python test_executor.py
```

---

## 📊 Core Data Model

The backend uses PostgreSQL with SQLAlchemy for persistent application data.

The system stores information related to:

```text
Users
  │
  ├── Submissions
  │       │
  │       └── Problems
  │
  └── Profile / Account information

Problems
  │
  └── Test Cases

Submissions
  │
  └── Verdict + execution result
```

This allows CodeArena to maintain submission history, user progress, solved-problem statistics, and leaderboard rankings.

---

## 🎯 What I Built

The main engineering challenge in CodeArena was implementing the complete submission-to-verdict pipeline.

A submission travels through the following process:

1. The user submits source code from the React frontend.
2. FastAPI validates the request and identifies the selected problem.
3. The backend retrieves the problem's test cases.
4. The executor prepares a temporary workspace.
5. C++ submissions are compiled with `g++`; Python submissions are executed directly.
6. Execution is monitored for time and output constraints.
7. Program output is compared against the expected output.
8. A final verdict is generated.
9. The submission result is stored in PostgreSQL.
10. The verdict and execution result are returned to the frontend.

This project helped me work across frontend development, REST APIs, authentication, relational databases, process execution, error handling, and software architecture.

---

## 📸 Screenshots

Screenshots of the following application areas will be added here:

- CodeArena homepage
- Problem listing
- Problem solving/editor screen
- Submission result
- Submission history
- Leaderboard
- Profile

---

## 🔮 Future Improvements

Potential future improvements include:

- Stronger container-level sandboxing for untrusted code execution
- More programming languages
- Background job queues for submissions
- Redis-based caching
- Contest system
- Advanced ranking algorithms
- Code execution worker services
- Horizontal scaling of judge workers
- Automated deployment and monitoring

---

## 📌 Project Status

**Core development: Completed**

CodeArena currently provides a complete full-stack coding-judge workflow with authentication, problem solving, code execution, submission tracking, and leaderboard functionality.

---

## 👨‍💻 Author

**Abhiram Naik**

GitHub:  
https://github.com/abhiram-naik

---

## ⭐ Why CodeArena?

CodeArena was built as a full-stack software engineering project rather than a simple CRUD application.

It combines:

- Frontend engineering
- Backend API development
- Authentication
- Relational database design
- Code execution
- Process management
- Error handling
- Automated testing
- Competitive programming workflows
- Git/GitHub development practices

The project demonstrates how multiple backend and frontend components work together to build a complete software product.