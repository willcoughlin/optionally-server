docker build -t optionally-server:latest --build-arg mode=development .
docker tag optionally-server:latest 407247772095.dkr.ecr.us-east-1.amazonaws.com/optionally-server:latest
docker push 407247772095.dkr.ecr.us-east-1.amazonaws.com/optionally-server:latest