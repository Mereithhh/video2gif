# voide2gif

在线视频转动图

> 有一天突然有了这个需求，于是在 AI 的帮助下做了这么个玩意儿。

[在线使用](https://video2gif.mereith.com)

![pre](img/pre.png)

## 自己部署
```shell
docker run -d --name video2gif --restart always -p 3000:3000 docker.io/mereith/video2gif
```

然后打开 `http://<ip>:3000` 即可