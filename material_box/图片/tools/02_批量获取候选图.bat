@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo [MaterialBox] 将为 materials.json 中的材料获取宏观图片候选。
echo 默认每种材料保存 3 张，来源为 Wikimedia Commons。
echo.
set /p CONTACT=请输入你的邮箱或项目主页（用于 API User-Agent，可直接回车跳过）: 
if "%CONTACT%"=="" (
  py tools\fetch_material_images.py fetch --limit 3
) else (
  py tools\fetch_material_images.py fetch --limit 3 --contact "%CONTACT%"
)
echo.
echo 完成后请运行 03_打开审核页.bat。
pause
