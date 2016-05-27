Crontab UI
==========

Editing the plain text crontab is error prone for managing jobs, e.g., adding jobs, deleting jobs, or pausing jobs. A small mistake can easily bring down all the jobs and might cost you a lot of time. With Crontab UI, it is very easy to manage crontab. Here are the key features of Crontab UI.

![flow](http://alseambusher.github.io/files/flow.gif)

1. Easy setup
2. Safe adding, deleting or pausing jobs. Easy to maintain hundreds of jobs.
3. Backup your crontabs.
4. Export crontab and deploy on other machines without much hassle.
5. Error log support (NEW)

Read [this](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html) to see more details.

##Setup

    npm install crontab-ui
    crontab-ui

###Adding, deleting, pausing and resuming jobs.

Once setup Crontab UI provides you with a web interface using which you can manage all the jobs without much hassle.

![basic](http://2.bp.blogspot.com/-kU8K-suZYMY/VX1Ml5b_JOI/AAAAAAAABEo/MAfgg7hWEz8/s1600/1.png)

###Backup and restore crontab

Keep backups of your crontab in case you mess up.
![backup](http://3.bp.blogspot.com/-qHxCbtNny9I/VX1M7k5UE3I/AAAAAAAABEw/cpiPgS9-gXo/s1600/2.png)

###Export and import crontab on multiple instances of Crontab UI.

If you want to run the same jobs on multiple machines simply export from one instance and import the same on the other. No SSH, No copy paste!

![export](http://2.bp.blogspot.com/-trpHt_etz5I/VX1NyElIicI/AAAAAAAABE4/GTZFBCfybLk/s1600/3.png)

But make sure to take a backup before importing.

###See when the job is going to run next.
![future](http://4.bp.blogspot.com/-gN-wLmhd5Os/VX6fQ5wM2LI/AAAAAAAABcA/_Ej0PqrByBU/s1600/next.gif)

###Separate error log support for every job
![logs](http://alseambusher.github.io/files/crontab_ui_log_feature.gif)

###Contribute
Fork Crontab UI and contribute to it. Pull requests are encouraged.

###License
[MIT](LICENSE.md)

