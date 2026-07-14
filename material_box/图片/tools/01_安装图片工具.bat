@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo [MaterialBox] 正在安装图片工具依赖...
py -m pip install -r tools\requirements.txt
if errorlevel 1 (
  echo 安装失败。请确认已安装 Python，并勾选 Add Python to PATH。
  pause
  exit /b 1
)
echo 安装完成。
pause
