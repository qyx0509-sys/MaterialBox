@echo off
chcp 65001 >nul
setlocal
start "" notepad.exe "%~dp0..\MATERIAL_MAINTENANCE_GUIDE.md"
