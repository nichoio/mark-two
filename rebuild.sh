#!/bin/bash
rm -rf build/*
truffle compile
# no migrating since there is no initial contract