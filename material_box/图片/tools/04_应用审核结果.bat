@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist review-selections.json (
  echo 项目根目录中没有 review-selections.json。
  echo 请先在审核页点击“导出选择结果”，再把文件复制到项目根目录。
  pause
  exit /b 1
)
py tools\fetch_material_images.py apply
pause
