@echo off
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
copy /Y bin\Release\net6.0\win-x64\publish\SAW.exe . 