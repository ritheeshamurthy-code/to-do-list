FROM python:3.12-slim

WORKDIR /app

ENV PYTHONONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY frontend ./frontend

ENV TODO_DB_PATH=/data/todos.TODO_DB_PATH

RUN mkdir -p /data