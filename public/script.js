let isLoaded = true;
document.getElementById('videoFile').addEventListener('change', function(e) {
    var fileName = e.target.files[0] ? e.target.files[0].name : '选择文件';
    document.getElementById('update-btn').textContent = fileName;
});
const setLoading = (loading) => {
    isLoaded = !loading;
    document.getElementById('loading').style.display = loading ? 'flex' : 'none';
    if (!loading) {
        updateLoadingText("加载中，请稍后")
    }
}

const updateLoadingText = (text) => {
    document.getElementById('loadingText').innerText = text;
}

window.onload = async () => {
    setLoading(false)
}





const doConvert2 = async (file, rate, speed, onProgress) => {
    // 检查文件格式

  
    const url = '/api/v1/convert';
    const formData = new FormData();
    formData.append('video', file);
    formData.append('rate', rate);
    formData.append('speed', speed);
    updateLoadingText("转换中，请稍后")
  
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
  
    if (!response.ok) {
      alert("转换失败，请联系开发者 233")
      setLoading(false)
    }
  
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    let chunks = [];
  
    while (true) {
      const { done, value } = await reader.read();
  
      if (done) {
        break;
      }
  
      chunks.push(value);
      receivedLength += value.length;
  
      if (onProgress && typeof onProgress === 'function') {
        const progress = Math.round((receivedLength / contentLength) * 100);
        onProgress(progress);
      }
    }
  
    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
  
    return chunksAll.buffer;
}

async function convertToGIF() {
    try {

        const videoFile = document.getElementById('videoFile').files[0];
        const sampleRate = document.getElementById('sampleRate').value || 5;
        const speed = document.getElementById('speed').value || 1;
        if (!videoFile) {
            alert('请先上传文件再进行转换！');
            return;
        }
        const acceptExts = ["mp4", "qt", "mov"]
        const ext = videoFile.name.split('.').pop().toLowerCase();
        if (!acceptExts.includes(ext)) {
          alert('只支持 mp4, qt, mov 格式的视频文件！');
          return
        }
        setLoading(true);
        const buffer = await doConvert2(videoFile, sampleRate,speed,(pect) => {
            updateLoadingText(`下载中，请稍后 ${pect}%`)    
        });
        setLoading(false)
        // Create a URL for the converted gif and display it
        const gifBlob = new Blob([buffer], { type: 'image/gif' });
        const gifUrl = URL.createObjectURL(gifBlob);

        showConvertedGIF(gifUrl)
    } catch (error) {
        console.error('Error:', error);
        alert('转换失败，请联系开发者 233');
    } finally {
        loadingDiv.style.display = 'none'; // 隐藏加载动画
    }
}

function showConvertedGIF(gifUrl) {
    // 显示模态框
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
    
    // 设置模态框中的 GIF 图片和下载链接
    var modalImage = document.getElementById('modalImage');
    modalImage.src = gifUrl;

    var downloadLink = document.getElementById('downloadLink');
    downloadLink.href = gifUrl;
}

// 关闭模态框
var closeModal = document.getElementsByClassName("close")[0];
closeModal.onclick = function() {
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}
