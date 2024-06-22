const express = require("express");
const path = require("path");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const app = express();
const port = 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 检查一下 tmp 文件夹是否存在，不存在则创建
const fs = require("fs");
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// 中间件，添加必要的 HTTP 请求头
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// 设置静态文件服务，指向 public 文件夹
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/v1/convert", upload.single("video"), (req, res) => {
  const file = req.file;
  const rate = req.body.rate;
  const speed = req.body.speed || 1; // 默认速度为1倍速

  if (!file) {
    return res.status(400).send("No video file uploaded");
  }

  if (!rate) {
    return res.status(400).send("No sample rate specified");
  }

  // 将文件写入临时目录
  const inputPath = path.join(__dirname, "temp", file.originalname);
  fs.writeFileSync(inputPath, file.buffer);

  const outputPath = path.join(__dirname, "temp", `${Date.now()}.gif`);
  // 使用 ffmpeg 转换视频文件
   // 获取视频信息
   ffmpeg.ffprobe(inputPath, (err, metadata) => {
    if (err) {
        return res.status(500).send('Failed to read video metadata');
    }

    const { width, height } = metadata.streams[0];
    let scaleFilter = '';

    if (width > 500 || height > 500) {
        if (width > height) {
            scaleFilter = ',scale=500:-1'; // 宽度为500，高度等比例缩放
        } else {
            scaleFilter = ',scale=-1:500'; // 高度为500，宽度等比例缩放
        }
    }
    let setptsFilter = `setpts=${1/speed}*PTS`;

    // 使用 ffmpeg 转换视频文件
    ffmpeg(inputPath)
        .output(outputPath)
        .outputOptions([
            `-vf fps=${rate}${scaleFilter},${setptsFilter}`
        ])
        .on('end', () => {
            // 读取转换后的 GIF 文件并发送回客户端
            fs.readFile(outputPath, (err, data) => {
                if (err) {
                    return res.status(500).send('Failed to read converted GIF');
                }

                // 删除临时文件
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);

                // 设置响应类型并发送 GIF 文件
                res.set('Content-Type', 'image/gif');
                res.send(data);
            });
        })
        .on('error', (err) => {
            console.error('Error during conversion:', err);
            res.status(500).send('Failed to convert video to GIF');
        })
        .run();
      });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
