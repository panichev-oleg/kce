#!/bin/bash

# Should be run from root folder of repo !!!

externalStartStationId="83" # борщаговка
externalMiddleStationId="85" # святошин
externalFinishStationId="88" # ирпень

DIRECTORY="./public/static"

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

getFilesInternal() {
    # URL to download the file from
    URL="https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRXpHpl4haRkvPX3UxrurO7U-Bt0iAjdrAv1adBTEsOryZCcfOxOP809ETCSrdpF88PocTONiRg3ycZ/pubhtml/sheet?headers=false&gid=433390657&range=A1:Z23"

    # Destination where the file will be saved
    DEST="./public/static/eltrain_internal.txt"

    echo URL

    # Download the file
    wget "$URL" -O "$DEST"
}

getFilesExternal $externalStartStationId $externalFinishStationId
getFilesExternal $externalMiddleStationId $externalFinishStationId
getFilesExternal $externalFinishStationId $externalMiddleStationId
getFilesExternal $externalFinishStationId $externalStartStationId

getFilesInternal