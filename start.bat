@echo off
REM Task 1: Navigate to the Frontend directory in Terminal 1
cd /d "Frontend"
start cmd /k npm run dev

REM Task 2: Open a new terminal (Terminal 2), navigate to the parent directory, then to the Backend directory, and execute "npm start"
start cmd /k "cd /d .. && cd Backend && node --watch index.js"
