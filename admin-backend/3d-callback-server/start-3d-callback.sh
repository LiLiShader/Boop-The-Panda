#!/bin/bash

# 进入proxy-server目录
cd "$(dirname "$0")"

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，请先安装Node.js"
    exit 1
fi

# 安装依赖
echo "检查并安装依赖..."
npm install express cors axios body-parser

# 启动3D支付回调服务器
echo "启动3D支付回调服务器..."
node 3d-callback-server.js 