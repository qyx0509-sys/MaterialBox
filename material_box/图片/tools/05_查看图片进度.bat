@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
py tools\fetch_material_images.py status --show-missing
pause
