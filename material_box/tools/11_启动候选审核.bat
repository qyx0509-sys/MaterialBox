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

if /i "%~1"=="--check" (
  echo PYTHON_OK: "%PYTHON_EXE%"
  if not exist "%TOOLS_DIR%material_manager.py" exit /b 1
  echo MANAGER_SCRIPT_OK: "%TOOLS_DIR%material_manager.py"
  powershell.exe -NoProfile -Command "try { Invoke-RestMethod http://127.0.0.1:8765/api/health -TimeoutSec 2 | Out-Null; Write-Output 'MANAGER_SERVER_OK'; exit 0 } catch { Write-Output 'MANAGER_SERVER_NOT_RUNNING'; exit 0 }"
  exit /b 0
)

powershell.exe -NoProfile -Command "try { Invoke-RestMethod http://127.0.0.1:8765/api/health -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo Starting the MaterialBox manager on 127.0.0.1:8765...
  powershell.exe -NoProfile -Command "Start-Process -FilePath '%PYTHON_EXE%' -ArgumentList @('%TOOLS_DIR%material_manager.py','--no-browser') -WorkingDirectory '%PROJECT_DIR%' -WindowStyle Hidden"
  timeout /t 2 /nobreak >nul
)

start "" "http://127.0.0.1:8765/research-review.html"
echo Review page: http://127.0.0.1:8765/research-review.html
timeout /t 2 /nobreak >nul

