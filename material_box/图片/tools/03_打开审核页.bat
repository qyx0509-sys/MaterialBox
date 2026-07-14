@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
start "MaterialBox Review Server" cmd /k "cd /d %CD% && py -m http.server 8000"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000/review-images.html"
echo 审核页已打开。完成选择后导出 review-selections.json，
echo 并把下载的文件复制到项目根目录。
pause
