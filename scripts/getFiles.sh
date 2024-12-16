#!/bin/bash

# Should be run from root folder of repo !!!

externalStartStationId="83" # борщаговка
externalMiddleStationId="85" # святошин
externalFinishStationId="88" # ирпень

INTERNAL_URL="https://swrailway.gov.ua/timetable/eltrain/?gid=1&rid=480&reverse=DIRECTION&eventdate=DATE&half=1&count=5"
EXTERNAL_URL="https://swrailway.gov.ua/timetable/eltrain/?sid1=FROM_ID&sid2=TO_ID&eventdate=DATE"

DIRECTORY="./public/static"

DAYS_COUNT=10

# Check if the directory exists
if [ -d "$DIRECTORY" ]; then
    # Clear the directory
    rm -rf "$DIRECTORY"/*.txt

    echo "Directory cleared."
else
    echo "Directory does not exist or is already empty."
fi

# Get the current date
CURRENT_DATE=$(date +'%Y-%m-%d')

getFilesExternal() {
    FROM_ID=$1
    TO_ID=$2

    # Loop through the next 10 days
    for ((i=0; i<=DAYS_COUNT; i++)); do
        # Calculate the date for the current iteration
        DATE=$(date -d "$CURRENT_DATE + $i days" +'%Y-%m-%d')

        # URL to download the file from
        URL=${EXTERNAL_URL/DATE/$DATE}
        URL=${URL/FROM_ID/$FROM_ID}
        URL=${URL/TO_ID/$TO_ID}

        # Destination where the file will be saved
        DEST="./public/static/eltrain_from_${FROM_ID}_to_${TO_ID}_date_${DATE}.txt"

        echo URL

        # Download the file
        wget "$URL" -O "$DEST"
    done
}

getFilesInternal() {
    DIRECTION=$1

    # Loop through the next 10 days
    for ((i=0; i<=DAYS_COUNT; i++)); do
        # Calculate the date for the current iteration
        DATE=$(date -d "$CURRENT_DATE + $i days" +'%Y-%m-%d')

        # URL to download the file from
        URL=$INTERNAL_URL
        URL=${URL/DATE/$DATE}
        URL=${URL/DIRECTION/$DIRECTION}

        # Destination where the file will be saved
        DEST="./public/static/internal_direction_${DIRECTION}_date_${DATE}.txt"

        echo $URL

        # Download the file
        wget "$URL" -O "$DEST"
    done
}

getFilesExternal $externalStartStationId $externalFinishStationId
getFilesExternal $externalMiddleStationId $externalFinishStationId
getFilesExternal $externalFinishStationId $externalMiddleStationId
getFilesExternal $externalFinishStationId $externalStartStationId

getFilesInternal "2"
getFilesInternal "1"