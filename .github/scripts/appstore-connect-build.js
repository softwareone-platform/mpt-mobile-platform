/**
 * App Store Connect Build Lookup
 *
 * Queries the App Store Connect API to find TestFlight builds.
 *
 * Usage:
 *   node appstore-connect-build.js latest          - Get the latest build ID
 *   node appstore-connect-build.js poll <buildId>   - Poll for a new build (different from <buildId>)
 *
 * Required env vars: API_KEY_ID, ISSUER_ID, BUNDLE_ID
 * The API key .p8 file must be at ~/private_keys/AuthKey_<API_KEY_ID>.p8
 *
 * Outputs the build ID to stdout. Debug/progress messages go to stderr.
 */
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const keyId = process.env.API_KEY_ID;
const issuerId = process.env.ISSUER_ID;
const keyPath = `${process.env.HOME}/private_keys/AuthKey_${keyId}.p8`;
const bundleId = process.env.BUNDLE_ID;

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateJWT() {
  const key = fs.readFileSync(keyPath, 'utf8');
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: issuerId, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' };
  const h = base64url(Buffer.from(JSON.stringify(header)));
  const p = base64url(Buffer.from(JSON.stringify(payload)));
  const input = `${h}.${p}`;
  const sig = crypto.sign('SHA256', Buffer.from(input), { key, dsaEncoding: 'ieee-p1363' });
  return `${input}.${base64url(sig)}`;
}

function apiGet(token, path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.appstoreconnect.apple.com',
      path,
      headers: { Authorization: `Bearer ${token}` }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        else resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getAppId(token) {
  process.stderr.write(`Looking up app: ${bundleId}\n`);
  const apps = await apiGet(token, `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`);
  if (!apps.data?.length) throw new Error('App not found');
  const appId = apps.data[0].id;
  process.stderr.write(`App API ID: ${appId}\n`);
  return appId;
}

async function getLatestBuildId(token, appId) {
  const builds = await apiGet(token, `/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=1`);
  return builds.data?.length ? builds.data[0].id : null;
}

async function cmdLatest() {
  const token = generateJWT();
  const appId = await getAppId(token);
  const buildId = await getLatestBuildId(token, appId);
  if (buildId) {
    process.stderr.write(`Latest build: ${buildId}\n`);
    process.stdout.write(buildId);
  }
}

async function cmdPoll(preUploadBuildId) {
  const token = generateJWT();
  const appId = await getAppId(token);
  process.stderr.write(`Pre-upload latest build: ${preUploadBuildId || 'none'}\n`);

  // Builds typically appear in the API ~2 min after altool upload.
  // Wait 90s before first check, then poll every 15s for up to 8 more attempts.
  process.stderr.write('Waiting 90s for Apple to register the build...\n');
  await sleep(90000);

  for (let i = 1; i <= 8; i++) {
    if (i > 1) await sleep(15000);
    process.stderr.write(`Attempt ${i}/8: checking for new build...\n`);

    const builds = await apiGet(token,
      `/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=1&fields[builds]=version,processingState`
    );

    if (builds.data?.length) {
      const latest = builds.data[0];
      if (latest.id !== preUploadBuildId) {
        process.stderr.write(`Found new build: ${latest.id} (version: ${latest.attributes?.version}, state: ${latest.attributes?.processingState})\n`);
        process.stdout.write(latest.id);
        return;
      }
      process.stderr.write(`Latest build ${latest.id} is still the pre-upload build, waiting...\n`);
    }
  }

  throw new Error('New build not found after polling');
}

const [command, ...args] = process.argv.slice(2);

const run = command === 'latest' ? cmdLatest() : command === 'poll' ? cmdPoll(args[0] || '') : Promise.reject(new Error('Usage: node appstore-connect-build.js <latest|poll> [preUploadBuildId]'));

run.catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
