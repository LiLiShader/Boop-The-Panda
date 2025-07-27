@echo off
echo 启动3D支付回调服务器...

:: 进入当前目录
cd /d "%~dp0"

:: 检查是否安装了Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js 未安装，请先安装Node.js
    pause
    exit /b 1
)

:: 安装依赖
echo 检查并安装依赖...
call npm install express cors axios body-parser

:: 启动3D支付回调服务器
echo 启动3D支付回调服务器...
node 3d-callback-server.js

pause 