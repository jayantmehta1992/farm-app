# Dockerfile for the FastAPI backend.
# Each line is a step Docker runs to build the image.

# 1. Start from an official, slim Python base image. "slim" = smaller size.
FROM python:3.12-slim

# 2. Environment tweaks for running Python in containers:
#    - DONTWRITEBYTECODE: don't create .pyc cache files (not needed here)
#    - UNBUFFERED: print logs immediately instead of buffering them
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Set the working directory inside the image. Everything below runs here.
WORKDIR /app

# 4. Copy ONLY requirements first, then install. Docker caches this layer, so
#    if your code changes but dependencies don't, it skips reinstalling them
#    — making rebuilds much faster.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Now copy the rest of the backend source code into the image.
COPY . .

# 6. Document that the app listens on port 8000.
EXPOSE 8000

# 7. The command that runs when the container starts.
#    --host 0.0.0.0 makes it reachable from outside the container
#    (127.0.0.1 would only be reachable from INSIDE it).
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
