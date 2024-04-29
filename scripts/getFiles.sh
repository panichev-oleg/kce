#!/bin/bash

# Should be run from root folder of repo !!!

externalStartStationId="83" # борщаговка
externalMiddleStationId="85" # святошин
externalFinishStationId="88" # ирпень

DIRECTORY="./public/static"

# Check if the directory exists
if [ -d "$DIRECTORY" ]; then
    # Clear the directory
    rm -r "$DIRECTORY"/*

    echo "Directory cleared."
else
    echo "Directory does not exist or is already empty."
fi

# Get the current date
CURRENT_DATE=$(date +'%Y-%m-%d')

getFiles() {
    FROM_ID=$1
    TO_ID=$2

    # Loop through the next 30 days
    for ((i=0; i<=10; i++)); do
        # Calculate the date for the current iteration
        DATE=$(date -d "$CURRENT_DATE + $i days" +'%Y-%m-%d')

        # URL to download the file from
        URL="https://swrailway.gov.ua/timetable/eltrain/?sid1=${FROM_ID}&sid2=${TO_ID}&eventdate=${DATE}"

        # Destination where the file will be saved
        DEST="./public/static/eltrain_from_${FROM_ID}_to_${TO_ID}_date_${DATE}.txt"

        echo URL

        # Download the file
        wget "$URL" -O "$DEST"
    done
}

getFiles $externalStartStationId $externalFinishStationId
getFiles $externalMiddleStationId $externalFinishStationId

git add -f ./public/static
git commit -m 'Uploaded new data files'
git push