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

if not exist "%TOOLS_DIR%sync_materials.py" (
  echo ERROR: sync_materials.py was not found.
  pause
  exit /b 1
)

"%PYTHON_EXE%" "%TOOLS_DIR%sync_materials.py"
if errorlevel 1 (
  echo.
  echo Sync failed. Review the error above and check materials.json.
) else (
  echo.
  echo Sync completed. Refresh the MaterialBox website.
)
pause

