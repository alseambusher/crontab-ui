#!/usr/bin/env node

var crontab = require("../crontab.js");
var path = require("path");

let id = "TODO";
let stderr = path.join(exports.cronPath, tab._id + ".stderr");
let stdout = path.join(exports.cronPath, tab._id + ".stdout");
let log_file = path.join(exports.log_folder, tab._id + ".log")


// if test -f /tmp/7ANZAyPKmrx0CsS6.stderr
// then date >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.log"
// cat /tmp/7ANZAyPKmrx0CsS6.stderr >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.log"
// fi
// if test -f /tmp/7ANZAyPKmrx0CsS6.stdout
// then date >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.stdout.log"
// cat /tmp/7ANZAyPKmrx0CsS6.stdout >> "/Users/alse/OneDrive/code/crontab-ui/crontabs/logs/7ANZAyPKmrx0CsS6.stdout.log"
// fi