const fs = require('fs');
const path = require('path');

const env = fs.readFileSync('.env.shared', 'utf-8');
const targets = [
    'apps/frontend/.env',
    'apps/runner/.env',
    'apps/ws-gateway/.env',
];

for (const file of targets) {
    const targetPath = path.resolve(__dirname, '..', file);
    fs.writeFileSync(targetPath, env);
    console.log(`✅ Synced → ${file}`);
}