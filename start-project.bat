@echo off
echo Starting Quickline Digital Queue Management System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

REM Start Backend
echo Starting Backend Server...
cd backend
start "Quickline Backend" cmd /k "npm run dev"
cd ..

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting Frontend Development Server...
cd frontend
start "Quickline Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Quickline is starting up!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin Login: admin / admin123
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul