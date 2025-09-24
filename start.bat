@echo off
echo Starting AI Social Media Platform...
echo.

echo Starting Backend Server...
cd backend
start cmd /k "npm run dev"

timeout /t 3

echo Starting Frontend Client...
cd ../frontend
start cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause