#!/usr/bin/env bash

if [ "$1" == "-b" ]; then
    docker build -t egs-backend .
fi

docker compose up
