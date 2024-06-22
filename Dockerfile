# 使用官方的 Node.js 镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 安装 ffmpeg
RUN apk add --no-cache ffmpeg

COPY . .

RUN npm install

# 暴露应用程序的端口
EXPOSE 3000

# 启动服务
CMD ["node", "server.cjs"]
