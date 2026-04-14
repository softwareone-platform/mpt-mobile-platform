/**
 * Google Play Developer API — AAB Upload
 *
 * Uploads an Android App Bundle to Google Play and assigns it to a track.
 *
 * Usage:
 *   node google-play-upload.js upload <aab-path>   - Upload AAB to the target track
 *   node google-play-upload.js status               - Show current track releases
 *
 * Required env vars:
 *   GOOGLE_PLAY_SA_JSON_PATH  - Path to the service account JSON key file
 *   PACKAGE_NAME              - Android package name (e.g. com.softwareone.marketplaceMobile)
 *   TRACK                     - Target track: internal (default), alpha, beta, production
 *
 * Outputs the uploaded versionCode to stdout. Progress/debug messages go to stderr.
 */
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const saJsonPath = process.env.GOOGLE_PLAY_SA_JSON_PATH;
const packageName = process.env.PACKAGE_NAME;
const track = process.env.TRACK || 'internal';

if (!saJsonPath || !packageName) {
  process.stderr.write('Error: GOOGLE_PLAY_SA_JSON_PATH and PACKAGE_NAME env vars are required\n');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(saJsonPath, 'utf8'));

// ── JWT / OAuth2 ───────────────────────────────────────────────────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateJWT() {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const h = base64url(Buffer.from(JSON.stringify(header)));
  const p = base64url(Buffer.from(JSON.stringify(payload)));
  const input = `${h}.${p}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(input), sa.private_key);
  return `${input}.${base64url(sig)}`;
}

function getAccessToken() {
  const jwt = generateJWT();
  const postData = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(jwt)}`;
  const tokenUrl = new URL(sa.token_uri || 'https://oauth2.googleapis.com/token');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: tokenUrl.hostname,
        path: tokenUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`Token error ${res.statusCode}: ${data.substring(0, 500)}`));
          resolve(JSON.parse(data).access_token);
        });
      },
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── Google Play Developer API helpers ──────────────────────────────────────────

const API_HOST = 'androidpublisher.googleapis.com';
const BASE = `/androidpublisher/v3/applications/${encodeURIComponent(packageName)}`;

function apiRequest(token, method, path, body, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (body) {
      headers['Content-Type'] = contentType;
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request({ hostname: API_HOST, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`API ${method} ${path} → ${res.statusCode}: ${data.substring(0, 500)}`));
        }
        resolve(data ? JSON.parse(data) : {});
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Upload an AAB file using streaming to handle large bundles.
 * Uses the resumable upload protocol for reliability.
 */
function uploadAAB(token, editId, aabPath) {
  const stats = fs.statSync(aabPath);
  const fileSize = stats.size;
  process.stderr.write(`Uploading AAB (${(fileSize / 1024 / 1024).toFixed(1)} MB)...\n`);

  return new Promise((resolve, reject) => {
    const uploadPath = `/upload${BASE}/edits/${editId}/bundles?uploadType=media`;
    const req = https.request(
      {
        hostname: API_HOST,
        path: uploadPath,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Upload failed ${res.statusCode}: ${data.substring(0, 500)}`));
          }
          resolve(JSON.parse(data));
        });
      },
    );
    req.on('error', reject);

    // Stream the file to avoid loading entire AAB into memory
    const stream = fs.createReadStream(aabPath);
    stream.pipe(req);
    stream.on('error', reject);
  });
}

// ── Commands ───────────────────────────────────────────────────────────────────

async function runEditFlow(token, aabPath, releaseStatus) {
  // Create edit
  process.stderr.write('Creating edit...\n');
  const edit = await apiRequest(token, 'POST', `${BASE}/edits`, JSON.stringify({ expiryTimeSeconds: '600' }));
  const editId = edit.id;
  process.stderr.write(`Edit created: ${editId}\n`);

  try {
    // Upload AAB
    const bundle = await uploadAAB(token, editId, aabPath);
    const versionCode = bundle.versionCode;
    process.stderr.write(`Bundle uploaded: versionCode ${versionCode}, sha256 ${bundle.sha256 || 'n/a'}\n`);

    // Assign to track
    process.stderr.write(`Assigning to ${track} track (status: ${releaseStatus})...\n`);
    await apiRequest(
      token,
      'PUT',
      `${BASE}/edits/${editId}/tracks/${track}`,
      JSON.stringify({
        track,
        releases: [{ versionCodes: [versionCode.toString()], status: releaseStatus }],
      }),
    );
    process.stderr.write(`Assigned to ${track} track\n`);

    // Commit edit
    process.stderr.write('Committing edit...\n');
    const committed = await apiRequest(token, 'POST', `${BASE}/edits/${editId}:commit`);
    process.stderr.write(`Edit committed: ${committed.id || editId}\n`);

    return versionCode;
  } catch (err) {
    // Clean up the edit on failure
    process.stderr.write(`Error during edit — deleting edit ${editId}...\n`);
    try {
      await apiRequest(token, 'DELETE', `${BASE}/edits/${editId}`);
      process.stderr.write('Edit deleted\n');
    } catch {
      process.stderr.write('Could not delete edit (may expire automatically)\n');
    }
    throw err;
  }
}

async function cmdUpload(aabPath) {
  if (!fs.existsSync(aabPath)) {
    throw new Error(`AAB file not found: ${aabPath}`);
  }

  process.stderr.write(`Package: ${packageName}\n`);
  process.stderr.write(`Track:   ${track}\n`);
  process.stderr.write(`AAB:     ${aabPath}\n\n`);

  process.stderr.write('Authenticating with Google Play...\n');
  const token = await getAccessToken();
  process.stderr.write('Authenticated\n\n');

  let versionCode;
  try {
    // Try with 'completed' status first (normal flow for verified apps)
    versionCode = await runEditFlow(token, aabPath, 'completed');
  } catch (err) {
    if (err.message.includes('draft app')) {
      // App hasn't passed org verification yet — Google Play only allows draft releases
      process.stderr.write('\nApp is in draft state (org verification pending). Retrying with draft status...\n\n');
      versionCode = await runEditFlow(token, aabPath, 'draft');
    } else {
      throw err;
    }
  }

  process.stderr.write(`\nUpload complete. Build is now available on the ${track} testing track.\n`);
  process.stdout.write(versionCode.toString());
}

async function cmdStatus() {
  process.stderr.write(`Checking ${track} track for ${packageName}...\n`);
  const token = await getAccessToken();

  // Create a temporary read-only edit
  const edit = await apiRequest(token, 'POST', `${BASE}/edits`, JSON.stringify({ expiryTimeSeconds: '60' }));

  try {
    const trackInfo = await apiRequest(token, 'GET', `${BASE}/edits/${edit.id}/tracks/${track}`);
    process.stderr.write(`\nTrack: ${trackInfo.track}\n`);

    if (trackInfo.releases && trackInfo.releases.length > 0) {
      for (const release of trackInfo.releases) {
        process.stderr.write(`  Status: ${release.status}\n`);
        process.stderr.write(`  Version codes: ${(release.versionCodes || []).join(', ')}\n`);
        if (release.name) process.stderr.write(`  Name: ${release.name}\n`);
        process.stderr.write('\n');
      }
    } else {
      process.stderr.write('  No releases found on this track\n');
    }
  } finally {
    // Delete the edit without committing
    await apiRequest(token, 'DELETE', `${BASE}/edits/${edit.id}`).catch(() => {});
  }
}

// ── Entry point ────────────────────────────────────────────────────────────────

const [command, ...args] = process.argv.slice(2);

const run =
  command === 'upload'
    ? cmdUpload(args[0] || '')
    : command === 'status'
      ? cmdStatus()
      : Promise.reject(new Error('Usage: node google-play-upload.js <upload|status> [aab-path]'));

run.catch((e) => {
  process.stderr.write(`\nError: ${e.message}\n`);
  process.exit(1);
});
