@echo off
for /f "tokens=*" %%a in (.env) do (
    set "line=%%a"
    rem Skip lines starting with '#'
    if not "!line:~0,1!"=="#" (
        for /f "tokens=1* delims==" %%i in ("%%a") do (
            set "var_name=%%i"
            set "var_value=%%j"
            rem Optional: Trim spaces (basic)
            rem For more robust trimming, PowerShell is better
            set "var_name=!var_name:~0,-1!"
            set "!var_name!=!var_value!"
        )
    )
)
