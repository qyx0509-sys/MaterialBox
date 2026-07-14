@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."

set "PYTHON_EXE="
where python >nul 2>nul && set "PYTHON_EXE=python"
if not defined PYTHON_EXE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if not defined PYTHON_EXE (
  echo 未找到 Python。请先安装 Python 3.10 或更高版本。
  pause
  exit /b 1
)

"%PYTHON_EXE%" tools\sync_materials.py
if errorlevel 1 (
  echo.
  echo 同步失败，请根据上方错误检查 materials.json。
) else (
  echo.
  echo 同步完成，可以刷新 index.html 查看结果。
)
pause
