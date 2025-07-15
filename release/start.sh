#!/bin/bash
echo "Starting services..."
echo

cd backend
echo "Installing backend dependencies..."
npm install
echo "Starting backend server..."
node server.js &

cd ../frontend
echo "Starting frontend server..."
http-server -p 8080

echo
echo "Services started!"
echo "Frontend: http://localhost:8080"
echo "Backend: http://localhost:3000"
echo 