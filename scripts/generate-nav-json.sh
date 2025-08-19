#!/bin/bash

navMarkdown="./pages/nav.md"

if [[ ! -e "${navMarkdown}" ]] ; then
    echo "No nav.md found in pages directory"
    exit 1
fi

# JS (JSON) file header
echo 'global$nav = {'

# Copy across the nav markdown
echo '    "content": ['
cat "${navMarkdown}" | sed -e 's/^/"/' -e 's/$/",/'
echo '""'
echo "    ]"

# Finish JS file
echo "};"
