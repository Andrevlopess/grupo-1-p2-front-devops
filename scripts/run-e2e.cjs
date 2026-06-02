const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const port = 4173;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function serveStaticFile(requestPath, response) {
  const normalizedPath = requestPath === '/' ? '/src/pages/brackets/index.html' : requestPath;
  const filePath = path.resolve(rootDir, '.' + normalizedPath);

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const resolvedPath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
  const resolvedStat = stat.isDirectory() ? fs.statSync(resolvedPath) : stat;
  const contentType = contentTypes[path.extname(resolvedPath).toLowerCase()] || 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': resolvedStat.size,
  });

  fs.createReadStream(resolvedPath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
  serveStaticFile(decodeURIComponent(requestUrl.pathname), response);
});

server.listen(port, '127.0.0.1', () => {
  const cypress = spawn('pnpm', ['exec', 'cypress', 'run', '--config', `baseUrl=http://127.0.0.1:${port}`], {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  cypress.on('exit', (exitCode) => {
    server.close(() => {
      process.exit(exitCode ?? 1);
    });
  });
});