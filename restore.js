'use strict';

const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');
const crontab = require('./crontab');

exports.crontabs = (dbName, callback) => {
  const db = new Datastore({ filename: path.join(crontab.db_folder, dbName) });
  db.loadDatabase(() => {});
  db.find({}).sort({ created: -1 }).exec((err, docs) => {
    callback(docs);
  });
};

exports.delete = (dbName) => {
  fs.unlink(path.join(crontab.db_folder, dbName), (err) => {
    if (err) {
      console.log(`Delete error: ${err}`);
    } else {
      console.log('Backup deleted');
    }
  });
};
