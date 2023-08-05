#!/bin/bash

param() {
    echo "${@:2}"
}

param ${@:3}
