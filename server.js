const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const base = path.resolve(__dirname);
const mime = Object.create(null);
['.html','text/html'],['.css','text/css'],['.js','application/javascript'],['.svg','image/svg+xml'],['.png','image/png'],['.jpg','image/jpeg'],['.json','application/json'],['.txt','text/plain']
  .forEach(([k,v]) => mime[k]=v);

const server = http.createServer((req,res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(base, urlPath);
  if (!filePath.startsWith(base)) { res.statusCode = 403; res.end('Forbidden'); return; }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) { res.statusCode = 404; res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => console.log(`Serving ${base} at http://localhost:${port}`));
