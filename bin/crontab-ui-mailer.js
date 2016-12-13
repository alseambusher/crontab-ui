#!/usr/bin/env node

var defaults = require("../config/mailconfig.js");

var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(defaults.transporterStr);
var mailOptions = defaults.mailOptions;

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputJSON = inputChunks.join(),
        mailOptions = JSON.parse(inputJSON);

        // outputJSON = JSON.stringify(parsedData, null, '    ');
    // stdout.write(outputJSON);
    // stdout.write('\n');
});

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
