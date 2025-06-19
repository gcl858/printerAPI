@echo off
echo 正在啟動印字機API控制庫測試服務器...
echo.

rem 檢查是否安裝了 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: 未安裝 Node.js
    echo 請到 https://nodejs.org/ 下載並安裝 Node.js
    pause
    exit /b 1
)

rem 檢查是否安裝了 http-server
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 正在安裝 http-server...
    npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo 錯誤: 無法安裝 http-server
        pause
        exit /b 1
    )
)

echo 啟動本地服務器...
echo 瀏覽器將自動開啟 http://localhost:8080
echo.
echo 按 Ctrl+C 可以停止服務器
echo.

http-server . -p 8080 -o

pause
