'use strict';

const basicAuth = require('express-basic-auth');

function setupAuth(app) {
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PWD;

  if (user && pwd) {
    app.use((req, res, next) => {
      res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      next();
    });
    app.use(basicAuth({
      users: { [user]: pwd },
    }));
  }
}

module.exports = setupAuth;
