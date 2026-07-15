@echo off
setlocal

set "TOOLS_DIR=%~dp0"
set "PROJECT_DIR=%~dp0..\"
set "PYTHON_EXE="

if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not defined PYTHON_EXE for /f "usebackq delims=" %%P in (`py.exe -3 -c "import sys; print(sys.executable)" 2^>nul`) do if not defined PYTHON_EXE set "PYTHON_EXE=%%P"
if not defined PYTHON_EXE for /f "usebackq delims=" %%P in (`python.exe -c "import sys; print(sys.executable)" 2^>nul`) do if not defined PYTHON_EXE set "PYTHON_EXE=%%P"

if not defined PYTHON_EXE (
  echo ERROR: Python 3 was not found.
  pause
  exit /b 1
)

"%PYTHON_EXE%" "%TOOLS_DIR%auto_research.py" --status
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo Detailed log: data\research\research-log.jsonl
echo Validation report: data\research\validation-report.json
if /i not "%~1"=="--check" pause

