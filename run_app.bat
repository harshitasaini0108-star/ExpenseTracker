@echo off
title Expense Tracker Web App
cd /d "%~dp0"
echo Starting Expense Tracker...
echo Open your browser at http://127.0.0.1:5000
.\venv\Scripts\python.exe app.py
pause
