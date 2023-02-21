#!/usr/bin/env node

var defaults = require("../config/mailconfig.js");
var crontab = require("../crontab.js");
var nodemailer = require('nodemailer');


const fs = require('fs');

function isFileEmpty(fileName) {
    const stat = fs.statSync(fileName);
    if (stat.size == 0 ) {
      return true;
    }
    return false;
}

crontab.get_crontab(process.argv[process.argv.length -1 -2], function(job){

  const stdout_file = process.argv[process.argv.length -1 -1];
  const stderr_file = process.argv[process.argv.length -1];

  if (isFileEmpty(stderr_file) &&  isFileEmpty(stdout_file)) {
    // no output. no need to email.
    return;
  }

  if (!job.mailing || job.mailing == undefined || job.mailing.mailOptions == undefined || job.mailing == {}) {
    var mailOptions = defaults.mailOptions;
    var transporterStr = defaults.transporterStr;
  } else {
    var mailOptions = job.mailing.mailOptions;
    var transporterStr = job.mailing.transporterStr ;
  }

  if (transporterStr == 'sendmail') { // allow sending mail with Postfix, and this is the default option
    var transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail',
      secure: true
    });
  } else {
    var transporter = nodemailer.createTransport(job.mailing.transporterStr);
  }

  const keywordsMap = {
    '#COMMAND_NAME#': job.name,
    '#COMMAND#': job.command,
    '#HASHED_EMAIL#': Buffer.from(mailOptions.to).toString('base64')
  };
  function replaceAll(str,mapObj){
      var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
      return str.replace(re, function(matched){
          return mapObj[matched];
      });
  }
  mailOptions.subject = replaceAll(mailOptions.subject, keywordsMap);
  mailOptions.text = replaceAll(mailOptions.text, keywordsMap);
  mailOptions.html = replaceAll(mailOptions.html, keywordsMap);

  mailOptions.attachments = [{filename: "stdout.txt", path: stdout_file}, {filename: "stderr.txt", path: stderr_file}];

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
});
