docker build -t docker.io/mereith/video2gif .
docker push docker.io/mereith/video2gif
kubectl rollout restart deployment/video2gif -n tools
kubectl rollout status deployment/video2gif -n tools
