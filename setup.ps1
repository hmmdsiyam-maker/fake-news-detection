<#
.SYNOPSIS
    Automated Setup Script for Veritas Fake News Detection Platform
.DESCRIPTION
    This script initializes the environment for both the frontend (Next.js) 
    and the backend (FastAPI/Machine Learning).
    
    Tasks performed:
    1. Copies .env.example to .env for both frontend and backend.
    2. Installs Node.js dependencies for fake-news-ui.
    3. Creates a Python virtual environment and installs dependencies for fake-news-ml.
#>

$ErrorActionPreference = 'Stop'

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Veritas Fake News Detection - Environment Setup script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$rootDir = Get-Location
$uiDir = Join-Path $rootDir "fake-news-ui"
$mlDir = Join-Path $rootDir "fake-news-ml"

# ---------------------------------------------------------
# Step 1: Environment Variables Setup
# ---------------------------------------------------------
Write-Host "`n[1/3] Configuring Environment Variables..." -ForegroundColor Yellow

$uiEnvExample = Join-Path $uiDir ".env.example"
$uiEnv = Join-Path $uiDir ".env"
if (Test-Path $uiEnvExample) {
    if (-not (Test-Path $uiEnv)) {
        Copy-Item $uiEnvExample $uiEnv
        Write-Host "  -> Created fake-news-ui/.env" -ForegroundColor Green
    } else {
        Write-Host "  -> fake-news-ui/.env already exists, skipping." -ForegroundColor DarkGray
    }
}

$mlEnvExample = Join-Path $mlDir ".env.example"
$mlEnv = Join-Path $mlDir ".env"
if (Test-Path $mlEnvExample) {
    if (-not (Test-Path $mlEnv)) {
        Copy-Item $mlEnvExample $mlEnv
        Write-Host "  -> Created fake-news-ml/.env" -ForegroundColor Green
    } else {
        Write-Host "  -> fake-news-ml/.env already exists, skipping." -ForegroundColor DarkGray
    }
}

# ---------------------------------------------------------
# Step 2: Frontend (Node.js) Setup
# ---------------------------------------------------------
Write-Host "`n[2/3] Setting up Frontend (fake-news-ui)..." -ForegroundColor Yellow

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Set-Location $uiDir
    Write-Host "  -> Installing npm dependencies. This may take a moment..." -ForegroundColor Gray
    npm install
    Write-Host "  -> Frontend setup complete." -ForegroundColor Green
    Set-Location $rootDir
} else {
    Write-Host "  [X] npm is not installed or not in PATH. Please install Node.js." -ForegroundColor Red
}

# ---------------------------------------------------------
# Step 3: Backend (Python) Setup
# ---------------------------------------------------------
Write-Host "`n[3/3] Setting up Backend (fake-news-ml)..." -ForegroundColor Yellow

if (Get-Command python -ErrorAction SilentlyContinue) {
    Set-Location $mlDir
    
    # Check if venv exists
    $venvDir = Join-Path $mlDir "venv"
    if (-not (Test-Path $venvDir)) {
        Write-Host "  -> Creating Python virtual environment (venv)..." -ForegroundColor Gray
        python -m venv venv
    } else {
        Write-Host "  -> Virtual environment already exists." -ForegroundColor DarkGray
    }

    # Determine activation script path
    $activateScript = Join-Path $venvDir "Scripts\activate.ps1"
    
    if (Test-Path $activateScript) {
        Write-Host "  -> Installing Python requirements..." -ForegroundColor Gray
        # Run pip install using the python executable inside the venv directly
        $venvPython = Join-Path $venvDir "Scripts\python.exe"
        & $venvPython -m pip install --upgrade pip
        & $venvPython -m pip install -r requirements.txt
        Write-Host "  -> Backend setup complete." -ForegroundColor Green
    } else {
        Write-Host "  [X] Could not find venv Scripts. Environment may be corrupted." -ForegroundColor Red
    }
    
    Set-Location $rootDir
} else {
    Write-Host "  [X] python is not installed or not in PATH. Please install Python 3." -ForegroundColor Red
}

# ---------------------------------------------------------
# Final Instructions
# ---------------------------------------------------------
Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " Setup Complete! You are ready to run the project." -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Cyan

Write-Host "To start the application, open two separate terminals:`n"
Write-Host "Terminal 1 (Backend):" -ForegroundColor Magenta
Write-Host "  cd fake-news-ml"
Write-Host "  .\venv\Scripts\Activate.ps1"
Write-Host "  uvicorn app.main:app --reload`n"

Write-Host "Terminal 2 (Frontend):" -ForegroundColor Magenta
Write-Host "  cd fake-news-ui"
Write-Host "  npm run dev`n"

Write-Host "Note: Ensure you configure your database and Stripe keys in fake-news-ml/.env before starting the backend." -ForegroundColor Yellow
