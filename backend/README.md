# Backend Setup

This backend implements the Ambulance Dispatch API using FastAPI and OSMnx.

## Install dependencies

Create a Python virtual environment and install the required packages:

```powershell
cd f:\DSA-ambulance-project\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run the API

```powershell
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /map`
- `GET /ambulances`
- `GET /logs`
- `GET /predict`
- `POST /dispatch`
- `POST /ambulance/move`
