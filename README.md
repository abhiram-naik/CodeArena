# CodeArena

CodeArena is a full-stack online coding judge platform where users can solve programming problems, submit code, receive execution verdicts, track submissions, and compete on a leaderboard.

## 🚀 Features

- 🔐 User registration and login
- 🔑 JWT-based authentication
- 🔄 Password reset functionality
- 🔒 Protected API endpoints
- 👤 User profile management
- 🧩 Programming problem management
- 🧪 Test case management
- ⚡ C++ and Python code execution
- ⏱️ Execution time limits
- 📦 Code, input, and output size limits
- 📝 Submission history
- 📊 Submission statistics
- 🏆 Competitive leaderboard
- 🎯 Accepted / Runtime Error / Compilation Error / Time Limit Exceeded verdicts
- 📖 Interactive FastAPI Swagger documentation

## 🛠️ Tech Stack

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
- JWT Authentication

### Database

- PostgreSQL

### Code Execution

- Python execution through isolated temporary files
- C++17 compilation and execution through `g++`
- Process timeout handling
- Output size restrictions
- Temporary workspace cleanup

## 🏗️ Project Structure

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