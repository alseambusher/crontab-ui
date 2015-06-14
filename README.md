Crontab UI
==========

Editing the plain text crontab is error prone for managing jobs, e.g., adding jobs, deleting jobs, or pausing jobs. A small mistake can easily bring down all the jobs and might cost you a lot of time. With Crontab UI, it is very easy to manage crontab. Here are the key features of Crontab UI.

![flow](http://alseambusher.github.io/files/flow.gif)

1. Easy setup
2. Safe adding, deleting or pausing jobs. Easy to maintain hundreds of jobs.
3. Backup your crontabs.
4. Export crontab and deploy on other machines without much hassle.

Read [this](http://lifepluslinux.blogspot.in/2015/06/crontab-ui-easy-and-safe-way-to-manage.html) to see more details.

##Setup

    git clone https://github.com/alseambusher/crontab-ui
    cd crontab-ui
    npm install
    node app.js

###TODO

1. Run jobs as different user in one place.
2. Profiling jobs.
3. Logs.
4. Importing from existing crontab file.


