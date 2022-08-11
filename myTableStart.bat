f:
start /min myTableBack.bat
start /min myTableFront.bat
timeout /T 180
start microsoft-edge:http://localhost:3000/
