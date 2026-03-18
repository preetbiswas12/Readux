@echo off
REM Project Aegis - Android Build Script for Windows
REM Builds APK with all native modules and permissions

setlocal enabledelayedexpansion

echo ========================================
echo  Project Aegis - Android APK Builder
echo ========================================
echo.

REM Set environment variables
if not defined ANDROID_HOME (
    echo.
    echo ERROR: ANDROID_HOME not set!
    echo Please set ANDROID_HOME to your Android SDK directory
    echo Example: set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\sdk
    exit /b 1
)

if not defined JAVA_HOME (
    echo WARNING: JAVA_HOME not set. Gradle will try to find Java automatically.
)

echo ANDROID_HOME: %ANDROID_HOME%
echo JAVA_HOME: %JAVA_HOME%
echo.

REM Change to android directory
cd /d "%~dp0\android" || (
    echo ERROR: Cannot navigate to android directory
    exit /b 1
)

REM Menu
echo Select build type:
echo 1. Debug APK (faster, for testing)
echo 2. Release APK (for production)
echo 3. Clean build
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Building Debug APK...
    echo.
    call gradlew :app:assembleDebug
    if %ERRORLEVEL% NEQ 0 (
        echo Build failed!
        exit /b 1
    )
    echo.
    echo Success! Debug APK: app\build\outputs\apk\debug\app-debug.apk
    echo.
) else if "%choice%"=="2" (
    echo.
    echo Building Release APK...
    echo.
    call gradlew :app:assembleRelease
    if %ERRORLEVEL% NEQ 0 (
        echo Build failed!
        exit /b 1
    )
    echo.
    echo Success! Release APK: app\build\outputs\apk\release\app-release.apk
    echo.
    echo WARNING: This APK is unsigned. You need to sign it before uploading.
    echo Run: eas build --platform android --profile production
    echo.
) else if "%choice%"=="3" (
    echo.
    echo Cleaning build...
    echo.
    call gradlew clean
    echo Clean complete!
    echo.
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
    exit /b 1
)

echo.
pause
