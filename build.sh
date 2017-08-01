#!/bin/sh

rm -rf ./dist
mkdir dist

cp -R package.json LICENSE README.md dist

./node_modules/.bin/babel lib -d dist/lib
# ./node_modules/.bin/babel test -d dist/test
./node_modules/.bin/babel index.js -d dist

echo 'build succeeded'
