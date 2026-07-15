@echo off
setlocal

set "TOOLS_DIR=%~dp0"
set "PROJECT_DIR=%~dp0..\"
set "PYTHON_EXE="

if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not defined PYTHON_EXE for /f "usebackq delims=" %%P in (`py.exe -3 -c "import sys; print(sys.executable)" 2^>nul`) do if not defined PYTHON_EXE set "PYTHON_EXE=%%P"
if not defined PYTHON_EXE for /f "usebackq delims=" %%P in (`python.exe -c "import sys; print(sys.executable)" 2^>nul`) do if not defined PYTHON_EXE set "PYTHON_EXE=%%P"

if not defined PYTHON_EXE (
  echo ERROR: Python 3 was not found. See AUTO_RESEARCH_GUIDE.md.
  pause
  exit /b 1
)

if not exist "%TOOLS_DIR%auto_research.py" (
  echo ERROR: auto_research.py was not found.
  pause
  exit /b 1
)

if /i "%~1"=="--check" (
  echo PYTHON_OK: "%PYTHON_EXE%"
  "%PYTHON_EXE%" "%TOOLS_DIR%auto_research.py" --limit 10 --resume --plan
  if errorlevel 1 exit /b 1
  exit /b 0
)

"%PYTHON_EXE%" -c "from PIL import Image" >nul 2>nul
if errorlevel 1 (
  echo Research dependencies are not installed.
  choice /C YN /N /M "Install tools\requirements-research.txt now? [Y/N] "
  if errorlevel 2 exit /b 1
  "%PYTHON_EXE%" -m pip install -r "%TOOLS_DIR%requirements-research.txt"
  if errorlevel 1 (
    echo Dependency installation failed. Check the network and AUTO_RESEARCH_GUIDE.md.
    pause
    exit /b 1
  )
)

echo ==================================================
echo Default batch size: 10 materials.
echo Resume mode: completed materials are skipped before selecting the next batch.
echo Formal materials.json and formal images will not be modified.
echo ==================================================
"%PYTHON_EXE%" "%TOOLS_DIR%auto_research.py" --limit 10 --resume --plan
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
choice /C YN /N /M "Generate the candidates shown above? [Y/N] "
if errorlevel 2 (
  echo Cancelled. No candidates were generated.
  pause
  exit /b 0
)

"%PYTHON_EXE%" "%TOOLS_DIR%auto_research.py" --limit 10 --resume
echo.
if errorlevel 1 (
  echo The run reported errors. See data\research\research-log.jsonl.
) else (
  echo Candidate generation completed. Next run tools\11_*.bat.
)
pause
