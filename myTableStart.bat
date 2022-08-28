rem start /min myTableBack.bat
start /min myTableFront.bat
timeout /T 140
start microsoft-edge:http://localhost:3000/
