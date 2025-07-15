@echo off
echo Starting services...
echo.

cd backend
echo Installing backend dependencies...
call npm install
echo Starting backend server...
start node server.js

cd ../frontend
echo Starting frontend server...
start http-server -p 8080

echo.
echo Services started!
echo Frontend: http://localhost:8080
echo Backend: http://localhost:3000
echo.
pause 