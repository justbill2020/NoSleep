# NoSleep

This app is designed to move the cursor 1 pixel left and right every 30 seconds after the computer is idle for 3 minutes. 

You can also specify in the command line the interval, debounce and timeout values. The app is verbose by default. 

Running the app with default values
```
npm start
```

Running the app with options
```
npm start -- --timeout <minutes> -debounce <seconds> --interval <seconds> --quiet
```

## Options

Option|Description
------|-----------
-i, --interval <seconds> | The number of seconds to wait between cursor movements. [default is 30 seconds]
-t, --timeout <minutes> | The number of minutes to wait after user input before moving cursor. [default is 3 minutes]
-d, --debounce <seconds> | The number of seconds after user input to suspend input detection. [default is 1 second]
-q, --quiet | Silence Output
-h, --help | Print out helpful usage information.