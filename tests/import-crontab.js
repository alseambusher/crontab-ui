'use strict';

/* global describe, it, expect */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function importJobs(text) {
  const jobs = [];
  const commands = [];
  class Datastore {
    loadDatabase(callback) { callback(); }
    findOne(_query, callback) { callback(null, null); }
    insert(job) { jobs.push(job); }
  }
  const context = {
    exports: {},
    __dirname: path.resolve(__dirname, '..'),
    process: { env: {} },
    console: { log() {} },
    require(name) {
      if (name === '@seald-io/nedb') return Datastore;
      if (name === 'fs') return { existsSync: () => true };
      if (name === 'child_process') {
        return { exec(command, callback) { commands.push(command); callback(null, text); } };
      }
      return require(name);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../crontab.js'), 'utf8'), context);
  context.exports.import_crontab();
  expect(commands).toEqual(['crontab -l']);
  return jobs;
}

describe('Import crontab schedules', () => {
  it('imports @reboot jobs without requiring a next occurrence', () => {
    const jobs = importJobs('@reboot echo startup\n');
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ schedule: '@reboot', command: 'echo startup' });
  });

  it('continues importing recurring schedules', () => {
    const jobs = importJobs('*/5 * * * * echo recurring\n@daily echo daily\n');
    expect(jobs.map((job) => job.schedule)).toEqual(['*/5 * * * *', '@daily']);
  });

  it('still ignores comments, environment variables and invalid schedules', () => {
    expect(importJobs('# comment\nSHELL=/bin/sh\n@invalid echo invalid\n70 * * * * echo invalid\n')).toHaveLength(0);
  });
});
