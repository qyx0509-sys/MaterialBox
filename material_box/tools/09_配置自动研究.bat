@echo off
setlocal

set "TOOLS_DIR=%~dp0"
set "PROJECT_DIR=%~dp0..\"
set "CONFIG_FILE=%TOOLS_DIR%research_config.json"
set "GUIDE_FILE=%PROJECT_DIR%AUTO_RESEARCH_GUIDE.md"

if not exist "%CONFIG_FILE%" (
  echo ERROR: Research config file was not found.
  echo Expected: "%CONFIG_FILE%"
  pause
  exit /b 1
)

if /i "%~1"=="--check" (
  echo CONFIG_OK: "%CONFIG_FILE%"
  if exist "%GUIDE_FILE%" echo GUIDE_OK: "%GUIDE_FILE%"
  exit /b 0
)

echo Opening MaterialBox research configuration...
start "" notepad.exe "%CONFIG_FILE%"

if exist "%GUIDE_FILE%" (
  start "" notepad.exe "%GUIDE_FILE%"
)

exit /b 0
