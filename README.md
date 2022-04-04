Crontab UI
==========

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=U8328Q7VFZMTS)
[![npm](https://img.shields.io/npm/v/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/dt/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/dm/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/docker/pulls/alseambusher/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/l/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)

Editing the plain text crontab is error prone for managing jobs, e.g., adding jobs, deleting jobs, or pausing jobs. A small mistake can easily bring down all the jobs and might cost you a lot of time. With Crontab UI, it is very easy to manage crontab. Here are the key features of Crontab UI.

![flow](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/flow.gif)

1. Easy setup. You can even import from existing crontab.
2. Safe adding, deleting or pausing jobs. Easy to maintain hundreds of jobs.
3. Backup your crontabs.
4. Export crontab and deploy on other machines without much hassle.
5. Error log support.
6. Mailing and hooks support.

Read [this](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html) to see more details.

## Setup

Get latest `node` from [here](https://nodejs.org/en/download/current/). Then,

    npm install -g crontab-ui
    crontab-ui

If you need to set/use an alternative host, port OR base url, you may do so by setting an environment variable before starting the process:

    HOST=0.0.0.0 PORT=9000 BASE_URL=/alse crontab-ui

By default, db, backups and logs are stored in the installation directory. It is **recommended** that it be overriden using env variable `CRON_DB_PATH`. This is particularly helpful in case you **update** crontab-ui.

    CRON_DB_PATH=/path/to/folder crontab-ui
    
If you need to apply basic HTTP authentication, you can set user name and password through environment variables:

    BASIC_AUTH_USER=user BASIC_AUTH_PWD=SecretPassword
    
Also, you may have to **set permissions** for your `node_modules` folder. Refer [this](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

If you need to use SSL, you can pass the private key and certificate through environment variables:

    SSL_CERT=/path/to/ssl_certificate SSL_KEY=/path/to/ssl_private_key

Make sure node has the correct **permissions** to read the certificate and the key.

If you need to autosave your changes to crontab directly:

    crontab-ui --autosave

### List of ennvironment variables supported
- HOST
- PORT
- BASE_URL
- CRON_DB_PATH
- CRON_PATH
- BASIC_AUTH_USER, BASIC_AUTH_PWD
- SSL_CERT, SSL_KEY 
- ENABLE_AUTOSAVE


## Docker
You can use crontab-ui with docker. You can use the prebuilt images in the [dockerhub](https://hub.docker.com/r/alseambusher/crontab-ui/tags)
```bash
docker run -d -p 8000:8000 alseambusher/crontab-ui
```

You can also build it yourself if you want to customize, like this:
```bash
git clone https://github.com/alseambusher/crontab-ui.git
cd crontab-ui
docker build -t alseambusher/crontab-ui .
docker run -d -p 8000:8000 alseambusher/crontab-ui
```

If you want to use it with authentication, You can pass `BASIC_AUTH_USER` and `BASIC_AUTH_PWD` as env variables
```bash
docker run -e BASIC_AUTH_USER=user -e BASIC_AUTH_PWD=SecretPassword -d -p 8000:8000 alseambusher/crontab-ui 
```

You can also mount a folder to store the db and logs.
```bash
mkdir -p crontabs/logs
docker run --mount type=bind,source="$(pwd)"/crontabs/,target=/crontab-ui/crontabs/ -d -p 8000:8000 alseambusher/crontab-ui
```

    
## Resources

* [Full usage details](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
* [Issues](https://github.com/alseambusher/crontab-ui/blob/master/README/issues.md)
* [Setup Mailing after execution](https://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html)
* [Integration with nginx and authentication](https://github.com/alseambusher/crontab-ui/blob/master/README/nginx.md)
* [Setup on Raspberry pi](https://lifepluslinux.blogspot.com/2017/03/setting-up-crontab-ui-on-raspberry-pi.html)

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
