'use strict';

const path = require('path');

function sanitizeFilename(name) {
  if (!name) return name;
  return path.basename(name);
}

function validateDbParam(req, res, next) {
  if (req.query.db) {
    const sanitized = sanitizeFilename(req.query.db);
    if (sanitized !== req.query.db) {
      return res.status(400).json({ message: 'Invalid db parameter' });
    }
  }
  next();
}

function validateIdParam(req, res, next) {
  if (req.query.id) {
    if (/[^a-zA-Z0-9_-]/.test(req.query.id)) {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }
  }
  next();
}

module.exports = { validateDbParam, validateIdParam };
