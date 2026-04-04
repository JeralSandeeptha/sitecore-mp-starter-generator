@echo off
setlocal
set "ROOT=%~dp0"
set "CLI=%ROOT%scx-cli\dist\cli.js"
if not exist "%CLI%" (
  echo [scx] Build the CLI first:
  echo   cd "%ROOT%scx-cli" ^&^& npm install ^&^& npm run build
  exit /b 1
)
node "%CLI%" %*
