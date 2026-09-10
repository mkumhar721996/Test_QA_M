const http = require('node:http');
const { createDefectService } = require('../services/defectService');

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
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

function createApp(service = createDefectService()) {
  return http.createServer(async (req, res) => {
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
          sendJson(res, 409, { message: result.message });
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
        const updated = service.updateAssignedDeveloper(segments[1], body.assignedDeveloper);
        if (!updated) {
          sendJson(res, 404, { message: 'Defect not found' });
          return;
        }
        sendJson(res, 200, updated);
        return;
      }

      sendJson(res, 404, { message: 'Not found' });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
  });
}

module.exports = { createApp };
