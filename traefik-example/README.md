Crontab UI - Traefik Example
==========

*Traefik is a modern HTTP reverse proxy and load balancer that makes deploying microservices easy.*

https://containo.us/traefik/



## Running Example

Assumes port 88 and 8088 are free.

1. `docker-compose build`
2. `docker-compose up`

Then go to 

- http://127.0.0.1:88/crontab  to view contrab-ui
- http://127.0.0.1:88/whoami  another docker container (containous/whoami) running on another path.
- http://127.0.0.1:8088/dashboard/ to view the Traefik dashbaord.





