   ^!c::  ; Ctrl+Alt+C
   WinGetActiveTitle, Title
   WinGetPos,,, Width, Height, %Title%
   WinMove, %Title%,, (A_ScreenWidth/2)-(Width/2), (A_ScreenHeight/2)-(Height/2)
   return