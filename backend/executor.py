import os
import sys
import subprocess
import tempfile
import shutil


# =========================================================
# EXECUTION SETTINGS
# =========================================================

PYTHON_TIMEOUT = 3
CPP_COMPILE_TIMEOUT = 10
CPP_RUN_TIMEOUT = 3

MAX_CODE_SIZE = 100_000          # 100 KB
MAX_INPUT_SIZE = 100_000         # 100 KB
MAX_OUTPUT_SIZE = 1_000_000      # 1 MB


# =========================================================
# WINDOWS PROCESS HELPERS
# =========================================================

def kill_process_tree(process):
    try:
        if process is None:
            return

        if os.name == "nt":
            subprocess.run(
                [
                    "taskkill",
                    "/F",
                    "/T",
                    "/PID",
                    str(process.pid)
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=5
            )
        else:
            process.kill()

    except Exception:
        pass


# =========================================================
# VALIDATION
# =========================================================

def validate_submission(code: str, input_data: str):

    if not isinstance(code, str):
        return {
            "valid": False,
            "message": "Invalid code"
        }

    if not isinstance(input_data, str):
        return {
            "valid": False,
            "message": "Invalid input"
        }

    if len(code.encode("utf-8")) > MAX_CODE_SIZE:
        return {
            "valid": False,
            "message": "Code size exceeds the allowed limit"
        }

    if len(input_data.encode("utf-8")) > MAX_INPUT_SIZE:
        return {
            "valid": False,
            "message": "Input size exceeds the allowed limit"
        }

    return {
        "valid": True,
        "message": ""
    }


# =========================================================
# OUTPUT LIMIT
# =========================================================

def check_output_size(output: str):

    return (
        len(output.encode("utf-8"))
        <= MAX_OUTPUT_SIZE
    )


# =========================================================
# PROCESS EXECUTION
# =========================================================

def run_process(
    process,
    input_data: str,
    timeout: int
):

    try:

        stdout, stderr = process.communicate(
            input=input_data,
            timeout=timeout
        )

    except subprocess.TimeoutExpired:

        kill_process_tree(process)

        return {
            "status": "Time Limit Exceeded",
            "output": ""
        }

    except Exception as e:

        kill_process_tree(process)

        return {
            "status": "Runtime Error",
            "output": str(e)
        }

    # -----------------------------------------------------
    # OUTPUT LIMIT
    # -----------------------------------------------------

    if not check_output_size(stdout):

        return {
            "status": "Runtime Error",
            "output": (
                "Output size exceeded "
                "the allowed limit"
            )
        }

    # -----------------------------------------------------
    # RUNTIME ERROR
    # -----------------------------------------------------

    if process.returncode != 0:

        return {
            "status": "Runtime Error",
            "output": stderr
        }

    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return {
        "status": "Success",
        "output": stdout
    }


# =========================================================
# PYTHON EXECUTION
# =========================================================

def execute_python_code(
    code: str,
    input_data: str
):

    validation = validate_submission(
        code,
        input_data
    )

    if not validation["valid"]:

        return {
            "status": "Runtime Error",
            "output": validation["message"]
        }

    temp_dir = None
    process = None

    try:

        temp_dir = tempfile.mkdtemp(
            prefix="codearena_python_"
        )

        source_file = os.path.join(
            temp_dir,
            "main.py"
        )

        with open(
            source_file,
            "w",
            encoding="utf-8"
        ) as file:

            file.write(code)

        environment = {
            "PATH": os.environ.get(
                "PATH",
                ""
            ),
            "SystemRoot": os.environ.get(
                "SystemRoot",
                ""
            ),
            "PYTHONDONTWRITEBYTECODE": "1",
            "PYTHONNOUSERSITE": "1"
        }

        process = subprocess.Popen(
            [
                sys.executable,
                "-I",
                source_file
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=temp_dir,
            env=environment,
            creationflags=(
                subprocess.CREATE_NEW_PROCESS_GROUP
                if os.name == "nt"
                else 0
            )
        )

        return run_process(
            process,
            input_data,
            PYTHON_TIMEOUT
        )

    except Exception as e:

        if process is not None:
            kill_process_tree(process)

        return {
            "status": "Runtime Error",
            "output": str(e)
        }

    finally:

        if temp_dir and os.path.exists(temp_dir):

            try:
                shutil.rmtree(
                    temp_dir,
                    ignore_errors=True
                )
            except Exception:
                pass


# =========================================================
# C++ EXECUTION
# =========================================================

def execute_cpp_code(
    code: str,
    input_data: str
):

    validation = validate_submission(
        code,
        input_data
    )

    if not validation["valid"]:

        return {
            "status": "Runtime Error",
            "output": validation["message"]
        }

    temp_dir = None
    process = None

    try:

        temp_dir = tempfile.mkdtemp(
            prefix="codearena_cpp_"
        )

        source_file = os.path.join(
            temp_dir,
            "main.cpp"
        )

        executable_file = os.path.join(
            temp_dir,
            "main.exe"
        )

        with open(
            source_file,
            "w",
            encoding="utf-8"
        ) as file:

            file.write(code)

        # -------------------------------------------------
        # COMPILE
        # -------------------------------------------------

        try:

            compile_result = subprocess.run(
                [
                    "g++",
                    source_file,
                    "-O2",
                    "-std=c++17",
                    "-o",
                    executable_file
                ],
                text=True,
                capture_output=True,
                timeout=CPP_COMPILE_TIMEOUT,
                cwd=temp_dir
            )

        except subprocess.TimeoutExpired:

            return {
                "status": "Compilation Error",
                "output": "Compilation timed out"
            }

        if compile_result.returncode != 0:

            return {
                "status": "Compilation Error",
                "output": compile_result.stderr
            }

        # -------------------------------------------------
        # RUN
        # -------------------------------------------------

        process = subprocess.Popen(
            [executable_file],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=temp_dir,
            creationflags=(
                subprocess.CREATE_NEW_PROCESS_GROUP
                if os.name == "nt"
                else 0
            )
        )

        return run_process(
            process,
            input_data,
            CPP_RUN_TIMEOUT
        )

    except Exception as e:

        if process is not None:
            kill_process_tree(process)

        return {
            "status": "Runtime Error",
            "output": str(e)
        }

    finally:

        if temp_dir and os.path.exists(temp_dir):

            try:
                shutil.rmtree(
                    temp_dir,
                    ignore_errors=True
                )
            except Exception:
                pass


# =========================================================
# MAIN EXECUTOR
# =========================================================

def execute_code(
    code: str,
    language: str,
    input_data: str
):

    if not isinstance(language, str):

        return {
            "status": "Unsupported Language",
            "output": ""
        }

    language = language.lower().strip()

    if language == "python":

        return execute_python_code(
            code,
            input_data
        )

    if language in ["cpp", "c++"]:

        return execute_cpp_code(
            code,
            input_data
        )

    return {
        "status": "Unsupported Language",
        "output": ""
    }