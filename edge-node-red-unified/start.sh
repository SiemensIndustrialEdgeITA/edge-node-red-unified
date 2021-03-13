#!/bin/sh
NODERED_FOLDER=/data
NODERED_SETTINGS=settings.js

# COPY MODIFIED NODE RED SETTINGS FILE
cp $NODERED_SETTINGS $NODERED_FOLDER/$NODERED_SETTINGS
echo "Custom settings copied."

# START NODE APP
echo "Starting NodeRED App..."
npm start --cache $NODERED_FOLDER/.npm -- --userDir $NODERED_FOLDER