#!/bin/bash

grep -naxv '.*' "$@"
file "$@"
