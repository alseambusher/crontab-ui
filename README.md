Crontab UI
==========

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=U8328Q7VFZMTS)
[![npm](https://img.shields.io/npm/dt/crontab-ui.svg?style=flat-square)](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/dm/crontab-ui.svg?style=flat-square)](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/v/crontab-ui.svg?style=flat-square)](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/l/crontab-ui.svg?style=flat-square)](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)

Editing the plain text crontab is error prone for managing jobs, e.g., adding jobs, deleting jobs, or pausing jobs. A small mistake can easily bring down all the jobs and might cost you a lot of time. With Crontab UI, it is very easy to manage crontab. Here are the key features of Crontab UI.

![flow](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/flow.gif)

1. Easy setup. You can even import from existing crontab.
2. Safe adding, deleting or pausing jobs. Easy to maintain hundreds of jobs.
3. Backup your crontabs.
4. Export crontab and deploy on other machines without much hassle.
5. Error log support.
6. Mailing and hooks support.

Read [this](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html) to see more details.

## Setup

Get latest `node` from [here](https://nodejs.org/en/download/current/). Then,

    npm install -g crontab-ui
    crontab-ui

If you need to set/use an alternate port, you may do so by setting an environment variable before starting the process:

    PORT=9000 crontab-ui
    
Also, you may have to **set permissions** for your `node_modules` folder. Refer [this](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

If you need to autosave your changes to crontab directly:

    crontab-ui --autosave

Setting up with docker:

```bash
git clone https://github.com/alseambusher/crontab-ui.git
cd crontab-ui
docker build -t alseambusher/crontab-ui .
docker run -d -p 8000:8000 alseambusher/crontab-ui
```
    
## Resources

* [Full usage details](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
* [Issues](https://github.com/alseambusher/crontab-ui/blob/master/README/issues.md)
* [Setup Mailing after execution](http://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html)
* [Integration with nginx and authentication](https://github.com/alseambusher/crontab-ui/blob/master/README/nginx.md)
* [Setup on Raspberry pi](http://lifepluslinux.blogspot.com/2017/03/setting-up-crontab-ui-on-raspberry-pi.html)

### Adding, deleting, pausing and resuming jobs.

Once setup Crontab UI provides you with a web interface using which you can manage all the jobs without much hassle.

![basic](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/main.png)

### Import from existing crontab

Import from existing crontab file automatically.
![import](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/import.gif)

### Backup and restore crontab

Keep backups of your crontab in case you mess up.
![backup](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/backup.png)

### Export and import crontab on multiple instances of Crontab UI.

If you want to run the same jobs on multiple machines simply export from one instance and import the same on the other. No SSH, No copy paste!

![export](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/import_db.png)

But make sure to take a backup before importing.

### Separate error log support for every job
![logs](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/log.gif)

### Donate
Like the project? [Buy me a coffee](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=U8328Q7VFZMTS)!

### Contribute
Fork Crontab UI and contribute to it. Pull requests are encouraged.

### License
[MIT](LICENSE.md)
