Hosting
=======

Install [nginx](http://nginx.org/) on your server. Then edit the configuration to map port 80 (or any other port) to 8000

```
sudo vi /etc/nginx/sites-available/default
```
Change it to this
```
server {
    listen 80;

    server_name localhost;

    location / {
        proxy_pass http://localhost:8000;
    }
}
```

##Authentication

You can enable basic http authentication with user name and password on nginx to prevent unauthorized users from accessing your cronjobs. Refer [this](https://www.digitalocean.com/community/tutorials/how-to-set-up-http-authentication-with-nginx-on-ubuntu-12-10).

