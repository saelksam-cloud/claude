import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { setEnvironmentContext } from '@netlify/blobs';
import { handle } from '../lib/app.js';

process.env.APP_PASSWORD = 'apercu';
setEnvironmentContext({ siteID: 'preview', token: 'preview', uncachedEdgeURL: 'https://blobs.test', edgeURL: 'https://blobs.test' });
const previewFile = resolve('.netlify/preview-data.json');
const blobs = new Map(JSON.parse(await readFile(previewFile, 'utf8').catch(() => '[]')));
globalThis.fetch = async (input, options) => {
  const req = new Request(input, options);
  const url = new URL(req.url);
  if (url.hostname !== 'blobs.test') throw new Error('Services externes désactivés dans cet aperçu.');
  if (req.method === 'PUT') { blobs.set(url.pathname, await req.text()); await writeFile(previewFile, JSON.stringify([...blobs])); return new Response(null); }
  return blobs.has(url.pathname) ? new Response(blobs.get(url.pathname)) : new Response(null, { status: 404 });
};
const publicDir = resolve('public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:4173');
    if (url.pathname.startsWith('/api/')) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const response = await handle(new Request(url, { method: req.method, headers: { ...req.headers, 'x-studio-password': 'apercu' }, body: chunks.length ? Buffer.concat(chunks) : undefined }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      return res.end(Buffer.from(await response.arrayBuffer()));
    }
    const path = resolve(publicDir, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(publicDir + sep)) { res.writeHead(404); return res.end(); }
    let file = await readFile(path);
    if (url.pathname === '/') file = file.toString().replace('<script src="/app.js"', '<script>if(!sessionStorage.previewStarted){localStorage.setItem("view",JSON.stringify("audit"));sessionStorage.previewStarted="1"}</script><script src="/app.js"');
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(file);
  } catch { res.writeHead(404); res.end(); }
}).listen(4173, '127.0.0.1', () => console.log('Aperçu sur http://127.0.0.1:4173'));
