Issues
======

You can submit issues in the [issue tracker](https://github.com/alseambusher/crontab-ui/issues) of the repository.

###Common issues
__crontab-ui is running but is not accessible on browser__ -
This is usually because the place where your crontab-ui is installed does not give access to others. It can be resolved by either giving permission to the user (Recommended) or running crontab-ui as root. Refer [this](https://github.com/alseambusher/crontab-ui/issues/8)

__Hosting crontab-ui : it works on localhost but not outside the server__ - You have to host it using nginx, apache2, etc. Refer [this](nginx.md).

__crontab-ui stopped working__ - It can happen that your crontab-ui can stop working for some reason like adding incorrect jobs or timings. You can try resetting crontab-ui by running `crontab-ui --reset`.

__Where is my root node_modules folder__ - You can find it by `npm root -g`

__Mailing related issue__ - Refer [this](https://github.com/alseambusher/crontab-ui/blob/master/README/mail.md).
