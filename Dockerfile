FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirments.txt .
RUN pip install --no-cache-dir -r requirments.txt

COPY app ./app
COPY frontend ./frontend

ENV TODO_DB_PATH=/data/todos.db

RUN mkdir -p /data

EXPOSE 5050

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]