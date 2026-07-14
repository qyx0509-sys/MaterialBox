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

"%PYTHON_EXE%" -c "from PIL import Image" >nul 2>nul
if errorlevel 1 (
  echo 首次使用需要安装 Pillow 图片处理组件。
  choice /M "现在安装所需组件"
  if errorlevel 2 exit /b 1
  "%PYTHON_EXE%" -m pip install -r tools\requirements-admin.txt
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络或按照 MATERIAL_MAINTENANCE_GUIDE.md 手动安装。
    pause
    exit /b 1
  )
)

"%PYTHON_EXE%" tools\material_manager.py
if errorlevel 1 (
  echo.
  echo 管理器未能启动。请确认 8765 端口未被占用。
  pause
)
