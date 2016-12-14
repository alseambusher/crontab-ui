#!/usr/bin/env node

var defaults = require("../config/mailconfig.js");
var crontab = require("../crontab.js");
var nodemailer = require('nodemailer');

crontab.get_crontab(process.argv[process.argv.length -1 -2], function(job){
  var transporter = nodemailer.createTransport(job.mailing.transporterStr);
  var mailOptions = job.mailing.mailOptions;

  mailOptions.attachments = [{filename: "stdout.txt", path: process.argv[process.argv.length -1 -1]}, {filename: "stderr.txt", path: process.argv[process.argv.length -1]}];

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
});
