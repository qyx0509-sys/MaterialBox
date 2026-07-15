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

if /i "%~1"=="--check" (
  "%PYTHON_EXE%" -c "from PIL import Image; print('MANAGER_DEPENDENCIES_OK')"
  if errorlevel 1 exit /b 1
  if not exist "%TOOLS_DIR%material_manager.py" exit /b 1
  echo MANAGER_SCRIPT_OK: "%TOOLS_DIR%material_manager.py"
  exit /b 0
)

"%PYTHON_EXE%" -c "from PIL import Image" >nul 2>nul
if errorlevel 1 (
  echo Material manager dependencies are not installed.
  choice /C YN /N /M "Install tools\requirements-admin.txt now? [Y/N] "
  if errorlevel 2 exit /b 1
  "%PYTHON_EXE%" -m pip install -r "%TOOLS_DIR%requirements-admin.txt"
  if errorlevel 1 (
    echo Dependency installation failed. See MATERIAL_MAINTENANCE_GUIDE.md.
    pause
    exit /b 1
  )
)

"%PYTHON_EXE%" "%TOOLS_DIR%material_manager.py"
if errorlevel 1 (
  echo.
  echo Manager failed to start. Check whether port 8765 is already in use.
  pause
)
