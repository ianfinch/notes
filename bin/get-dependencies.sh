#!/bin/bash

# Check we have everything we need
if [[ $( which curl ) == "" ]] ; then
    echo "No curl command available ... exiting"
    exit 1
fi

# Set up curl command
curl='curl --silent'

# Find out where we are
base=$( dirname $0 )/..

# We need a "lib" folder
if [[ ! -e "$base/lib" ]] ; then
    mkdir $base/lib
fi

if [[ ! -e "$base/lib/js" ]] ; then
    mkdir $base/lib/js
fi

if [[ ! -e "$base/lib/fonts" ]] ; then
    mkdir $base/lib/fonts
fi

# Grab the dependencies we need
(
    cd $base/lib/js
    $curl -O https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js
    $curl -O https://code.jquery.com/jquery-3.6.0.min.js
)

(
    cd $base/lib/fonts
    $curl -L "https://github.com/google/fonts/blob/main/apache/roboto/static/Roboto-Regular.ttf?raw=true" > Roboto-Regular.ttf
    $curl -L "https://github.com/google/fonts/blob/main/apache/roboto/static/Roboto-Italic.ttf?raw=true" > Roboto-Italic.ttf
    $curl -L "https://github.com/google/fonts/blob/main/apache/roboto/static/Roboto-Bold.ttf?raw=true" > Roboto-Bold.ttf
    $curl -L "https://github.com/google/fonts/blob/main/apache/roboto/static/Roboto-BoldItalic.ttf?raw=true" > Roboto-BoldItalic.ttf
)

(
    cd $base/lib
    $curl -O https://chessboardjs.com/releases/chessboardjs-1.0.0.zip
    unzip -q chessboardjs-1.0.0.zip
    find . -maxdepth 1 -type f -exec rm {} \;
    rm ./css/chessboard-1.0.0.css
    rm ./js/chessboard-1.0.0.js
)
