'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const mime = require('mime-types');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const busboy = require('connect-busboy');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const crontab = require('./crontab');
const restore = require('./restore');
const packageJson = require('./package.json');
const { base_url: baseUrl, routes, relative: routesRelative } = require('./routes');
const setupAuth = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const { validateDbParam, validateIdParam } = require('./middleware/validate');

dayjs.extend(relativeTime);

const app = express();
app.locals.baseURL = baseUrl;

// security headers (relaxed for local/HTTP usage and CDN assets)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
  strictTransportSecurity: false,
}));

// rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// basic auth
setupAuth(app);

// ssl credentials
const credentials = {
  key: process.env.SSL_KEY ? fs.readFileSync(process.env.SSL_KEY) : '',
  cert: process.env.SSL_CERT ? fs.readFileSync(process.env.SSL_CERT) : '',
};

if ((credentials.key && !credentials.cert) || (credentials.cert && !credentials.key)) {
  console.error('Please provide both SSL_KEY and SSL_CERT');
  process.exit(1);
}

const startHttpsServer = credentials.key && credentials.cert;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(busboy());

app.use(baseUrl, express.static(path.join(__dirname, 'public')));
app.use(baseUrl, express.static(path.join(__dirname, 'public', 'css')));
app.use(baseUrl, express.static(path.join(__dirname, 'public', 'js')));
app.use(baseUrl, express.static(path.join(__dirname, 'config')));

app.set('host', process.env.HOST || '127.0.0.1');
app.set('port', process.env.PORT || 8000);

// --- Routes ---

app.get(routes.root, (req, res) => {
  crontab.reload_db();
  crontab.crontabs((docs) => {
    res.render('index', {
      routes: JSON.stringify(routesRelative),
      crontabs: JSON.stringify(docs),
      backups: crontab.get_backup_names(),
      env: crontab.get_env(),
      dayjs,
    });
  });
});

app.post(routes.save, (req, res) => {
  if (req.body._id == -1) { // eslint-disable-line eqeqeq
    crontab.create_new(req.body.name, req.body.command, req.body.schedule, req.body.logging, req.body.mailing);
  } else {
    crontab.update(req.body);
  }
  res.end();
});

app.post(routes.stop, (req, res) => {
  crontab.status(req.body._id, true);
  res.end();
});

app.post(routes.start, (req, res) => {
  crontab.status(req.body._id, false);
  res.end();
});

app.post(routes.remove, (req, res) => {
  crontab.remove(req.body._id);
  res.end();
});

app.post(routes.run, (req, res) => {
  crontab.runjob(req.body._id);
  res.end();
});

app.get(routes.crontab, (req, res, next) => {
  crontab.set_crontab(req.query.env_vars, (err) => {
    if (err) next(err);
    else res.end();
  });
});

app.get(routes.backup, (req, res, next) => {
  crontab.backup((err) => {
    if (err) next(err);
    else res.end();
  });
});

app.get(routes.restore, validateDbParam, (req, res) => {
  restore.crontabs(req.query.db, (docs) => {
    res.render('restore', {
      routes: JSON.stringify(routesRelative),
      crontabs: JSON.stringify(docs),
      backups: crontab.get_backup_names(),
      db: req.query.db,
    });
  });
});

app.get(routes.delete_backup, validateDbParam, (req, res) => {
  restore.delete(req.query.db);
  res.end();
});

app.get(routes.restore_backup, validateDbParam, (req, res) => {
  crontab.restore(req.query.db);
  res.end();
});

app.get(routes.export, (req, res) => {
  const file = crontab.crontab_db_file;
  const filename = path.basename(file);
  const mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-type', mimetype);
  fs.createReadStream(file).pipe(res);
});

app.post(routes.import, (req, res, next) => {
  crontab.backup((err) => {
    if (err) return next(err);
    req.pipe(req.busboy);
    req.busboy.on('file', (_fieldname, file) => {
      const fstream = fs.createWriteStream(crontab.crontab_db_file);
      file.pipe(fstream);
      fstream.on('close', () => {
        crontab.reload_db();
        res.redirect(routes.root);
      });
    });
  });
});

app.get(routes.import_crontab, (req, res, next) => {
  crontab.backup((err) => {
    if (err) return next(err);
    crontab.import_crontab();
    res.end();
  });
});

app.get(routes.view_crontab, (req, res) => {
  const envVars = crontab.get_env();
  crontab.preview_crontab(envVars, (result) => {
    res.type('text/plain').send(result);
  });
});

function sendLog(filePath, req, res) {
  if (fs.existsSync(filePath)) {
    res.type('text/plain');
    res.set('Cache-Control', 'no-store');
    res.sendFile(filePath);
  } else {
    res.type('text/plain').send('No errors logged yet');
  }
}

app.get(routes.logger, validateIdParam, (req, res) => {
  sendLog(path.join(crontab.log_folder, `${req.query.id}.log`), req, res);
});

app.get(routes.stdout, validateIdParam, (req, res) => {
  sendLog(path.join(crontab.log_folder, `${req.query.id}.stdout.log`), req, res);
});

// error handler
app.use(errorHandler);

process.on('SIGINT', () => {
  console.log('Exiting crontab-ui');
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Exiting crontab-ui');
  process.exit();
});

const server = startHttpsServer
  ? https.createServer(credentials, app)
  : http.createServer(app);

server.listen(app.get('port'), app.get('host'), () => {
  console.log('Node version:', process.versions.node);

  fs.access(crontab.db_folder, fs.constants.W_OK, (err) => {
    if (err) {
      console.error('Write access to', crontab.db_folder, 'DENIED.');
      process.exit(1);
    }
  });

  if (process.argv.includes('--autosave') || process.env.ENABLE_AUTOSAVE) {
    crontab.autosave_crontab(() => {});
    fs.watchFile(crontab.crontab_db_file, () => {
      crontab.autosave_crontab(() => {
        console.log('Attempted to autosave crontab');
      });
    });
  }

  if (process.argv.includes('--reset')) {
    console.log('Resetting crontab-ui');

    for (const file of [crontab.crontab_db_file, crontab.env_file]) {
      console.log(`Deleting ${file}`);
      try {
        fs.unlinkSync(file);
      } catch (_e) {
        console.log(`Unable to delete ${file}`);
      }
    }

    crontab.reload_db();
  }

  const protocol = startHttpsServer ? 'https' : 'http';
  console.log(`Crontab UI (${packageJson.version}) is running at ${protocol}://${app.get('host')}:${app.get('port')}${baseUrl}`);
});

module.exports = app;
