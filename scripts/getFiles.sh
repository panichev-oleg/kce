#!/bin/bash



externalStartStationId="85" # святошин
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


# Loop through the next 30 days
for ((i=0; i<=30; i++)); do
    # Calculate the date for the current iteration
    DATE=$(date -d "$CURRENT_DATE + $i days" +'%Y-%m-%d')

    # URL to download the file from
    URL="https://swrailway.gov.ua/timetable/eltrain/?sid1=${externalStartStationId}&sid2=${externalFinishStationId}&eventdate=${DATE}"

    # Destination where the file will be saved
    DEST="./public/static/eltrain_from_${externalStartStationId}_to_${externalFinishStationId}_date_${DATE}.txt"

    # Download the file
    wget "$URL" -O "$DEST"
done

#git add ../public/static
#git status
#git commit -m 'Uploaded new data files'