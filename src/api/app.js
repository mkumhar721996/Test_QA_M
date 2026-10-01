const http = require('node:http');
const { createDefectService } = require('../services/defectService');

const MAX_BODY_BYTES = 1024 * 1024; // 1MB

class PayloadTooLargeError extends Error {}
class InvalidJsonBodyError extends Error {}

function readJsonBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;
    let rejected = false;
    req.on('data', (chunk) => {
      if (rejected) {
        return;
      }
      bytes += chunk.length;
      if (bytes > maxBytes) {
        rejected = true;
        reject(new PayloadTooLargeError('Request body exceeds the maximum allowed size'));
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (rejected) {
        return;
      }
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new InvalidJsonBodyError('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(body);
}

function logRequestError(req, err) {
  console.error(JSON.stringify({
    level: 'error',
    method: req.method,
    path: req.url,
    message: err.message,
    stack: err.stack,
  }));
}

function logRequestMetric(req, res, startedAt) {
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  console.log(JSON.stringify({
    level: 'info',
    type: 'request_metric',
    method: req.method,
    path: req.url,
    statusCode: res.statusCode,
    durationMs: Math.round(durationMs * 100) / 100,
  }));
}

function createApp(service = createDefectService()) {
  return http.createServer(async (req, res) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => logRequestMetric(req, res, startedAt));

    const url = new URL(req.url, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);

    try {
      if (req.method === 'POST' && segments.length === 1 && segments[0] === 'defects') {
        const input = await readJsonBody(req);
        const result = service.createDefect(input);
        if (!result.valid) {
          sendJson(res, 400, { errors: result.errors });
          return;
        }
        sendJson(res, 201, result.defect);
        return;
      }

      if (req.method === 'GET' && segments.length === 2 && segments[0] === 'defects') {
        const defect = service.getDefect(segments[1]);
        if (!defect) {
          sendJson(res, 404, { message: 'Defect not found' });
          return;
        }
        sendJson(res, 200, defect);
        return;
      }

      if (
        req.method === 'POST' &&
        segments.length === 3 &&
        segments[0] === 'defects' &&
        segments[2] === 'transitions-to-fixed'
      ) {
        const result = service.transitionToFixed(segments[1]);
        if (!result.success) {
          const status = result.reason === 'NOT_FOUND' ? 404 : 409;
          sendJson(res, status, { message: result.message });
          return;
        }
        sendJson(res, 200, result.defect);
        return;
      }

      if (
        req.method === 'PATCH' &&
        segments.length === 3 &&
        segments[0] === 'defects' &&
        segments[2] === 'assigned-developer'
      ) {
        const body = await readJsonBody(req);
        const result = service.updateAssignedDeveloper(segments[1], body.assignedDeveloper);
        if (!result.success) {
          const status = result.reason === 'NOT_FOUND' ? 404 : 400;
          sendJson(res, status, { message: result.message });
          return;
        }
        sendJson(res, 200, result.defect);
        return;
      }

      sendJson(res, 404, { message: 'Not found' });
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        logRequestError(req, err);
        sendJson(res, 413, { message: err.message });
        return;
      }
      if (err instanceof InvalidJsonBodyError) {
        logRequestError(req, err);
        sendJson(res, 400, { message: err.message });
        return;
      }
      logRequestError(req, err);
      sendJson(res, 500, { message: 'Internal Server Error' });
    }
  });
}

module.exports = { createApp };
