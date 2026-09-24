// check.js
// Smallest end-to-end smoke test. Boots the app on a free port and
// checks that a few routes respond (without touching the database).
import http from 'node:http';
import 'dotenv/config';

async function main() {
  let app;
  try {
    const mod = await import('../app.js');
    app = mod.buildApp();
  } catch (err) {
    console.error('[check] load failed:', err.message);
    process.exit(2);
  }

  const server = http.createServer(app);
  await new Promise(function (r) { server.listen(0, '127.0.0.1', r); });
  const port = server.address().port;
  const url = 'http://127.0.0.1:' + port;

  const results = [];
  async function expect(path, okStatus) {
    let res;
    try {
      res = await fetch(url + path, { headers: { Connection: 'close' } });
    } catch (err) {
      console.log('  X ' + path + ' -> fetch failed: ' + err.message);
      results.push(false);
      return;
    }
    if (res.status === okStatus || res.status === 401 || res.status === 503) {
      console.log('  OK ' + path + ' -> ' + res.status);
      results.push(true);
    } else {
      console.log('  X ' + path + ' -> ' + res.status);
      results.push(false);
    }
  }

  console.log('[check] wired up:');
  await expect('/api/health', 200); // 200 if DB is up, 503 if not (still proves the wiring)
  await expect('/api/auth/login', 400);
  await expect('/api/admin/stats', 401);
  await expect('/api/notifications', 401);
  await expect('/api/queue/today', 401);
  await expect('/api/search?q=ar', 401);

  const allOk = results.every(Boolean);
  server.close();
  process.exit(allOk ? 0 : 1);
}

main();
