# Dockerfile for custom mongodb to be deployed in render
FROM mongo:latest

ENV MONGO_INITDB_ROOT_USERNAME=mfc-root
ENV MONGO_INITDB_ROOT_PASSWORD=1q2w3e4r

EXPOSE 27017