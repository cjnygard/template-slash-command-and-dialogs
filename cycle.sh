#! /bin/bash

docker-compose down && \
docker build -t telomeric/tribalterms . && \
docker-compose up -d && \
docker logs -f tribalterms

