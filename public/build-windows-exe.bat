@echo off
echo ===================================================
echo  Measuring Learners English Writing - EXE Packager
echo ===================================================
echo.
echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo [2/3] Installing dependencies...
call npm install

echo [3/3] Compiling React frontend and building Windows EXE...
call npm run build:exe

echo.
echo ===================================================
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows EXE built successfully!
    echo Check the 'release' directory for your .exe installer.
    echo Location: %cd%\release\
) else (
    echo [FAILED] Compilation failed. Please check the logs above.
)
echo ===================================================
pause
