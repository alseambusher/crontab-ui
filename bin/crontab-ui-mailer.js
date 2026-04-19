#!/usr/bin/env node
'use strict';

const crontab = require('../crontab.js');
const nodemailer = require('nodemailer');

const jobId = process.argv[process.argv.length - 3];
const stdoutPath = process.argv[process.argv.length - 2];
const stderrPath = process.argv[process.argv.length - 1];

crontab.get_crontab(jobId, (job) => {
  const transporter = nodemailer.createTransport(job.mailing.transporterStr);
  const mailOptions = job.mailing.mailOptions;

  mailOptions.attachments = [
    { filename: 'stdout.txt', path: stdoutPath },
    { filename: 'stderr.txt', path: stderrPath },
  ];

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
});
