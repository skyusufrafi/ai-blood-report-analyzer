FROM python:3.14-slim

# Prevent Python from creating .pyc files
# and enable immediate log output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ---------------------------------------------------------
# Install Tesseract OCR
# ---------------------------------------------------------

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Application directory
# ---------------------------------------------------------

WORKDIR /app

# ---------------------------------------------------------
# Install Python dependencies
# ---------------------------------------------------------

COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --no-cache-dir \
    -r /app/backend/requirements.txt

# ---------------------------------------------------------
# Copy backend
# ---------------------------------------------------------

COPY backend /app/backend

# ---------------------------------------------------------
# Backend working directory
# ---------------------------------------------------------

WORKDIR /app/backend

# Make sure upload directory exists
RUN mkdir -p uploads

# ---------------------------------------------------------
# Render will provide PORT.
# If PORT isn't available, use 10000.
# ---------------------------------------------------------

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]