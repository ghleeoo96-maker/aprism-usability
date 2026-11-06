// 에이프리즘 사용성 평가 사이트 — node serve.mjs  (또는 열기.bat 더블클릭)
// 이 폴더(site)를 / 로, 옆 저장소 aprism-web 을 /app/ 으로 같은 주소에서 연다 — 사이트가 테스트 화면 안의 클릭을 기록하려면 같은 출처여야 한다.
// 저장소는 읽기만 한다. 포트 5299(PORT 로 바꿀 수 있다).
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { exec } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url));
// 옆에 app 폴더(테스트 화면 복사본)가 있으면 그것을, 없으면 저장소 aprism-web 을 쓴다
const APP = process.env.APP_ROOT || (fs.existsSync(path.join(HERE, 'app')) ? path.join(HERE, 'app') : path.join(HERE, '..', '..', 'aprism-web'));
const PORT = Number(process.env.PORT) || 5299;
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.mp4':'video/mp4', '.woff2':'font/woff2', '.glb':'model/gltf-binary' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const isApp = url.startsWith('/app/');
  const root = isApp ? APP : HERE;
  let f = path.normalize(path.join(root, isApp ? url.slice(4) : url));
  if (!f.startsWith(path.normalize(root))) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(b);
  });
}).listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}/`;
  console.log('사용성 평가 사이트 → ' + url + '\n(끄려면 이 창에서 Ctrl+C)');
  if (!process.env.NO_OPEN) exec(`start "" "${url}"`);
});
