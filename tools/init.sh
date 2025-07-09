#!/bin/sh

echo "🚦 Starting init.sh"

# 🗂️ Check if node_modules exists and is not empty
if [ -d node_modules ] && [ "$(ls -A node_modules | wc -l)" -gt 0 ]; then
  echo "🟡 Skipping install: node_modules already exists and is not empty."
else
  echo "📦 Installing dependencies..."
  
  if [ -f yarn.lock ]; then
    echo "🔵 Detected yarn.lock, installing with yarn"
    yarn install --frozen-lockfile
  elif [ -f package-lock.json ]; then
    echo "🟢 Detected package-lock.json, installing with npm"
    npm ci
  elif [ -f pnpm-lock.yaml ]; then
    echo "🟣 Detected pnpm-lock.yaml, installing with pnpm"
    corepack enable pnpm
    pnpm install --frozen-lockfile
  else
    echo "🔴 No lockfile found. Exiting."
    exit 1
  fi
fi

# 👮 UID/GID mismatch check (just a warning)
HOST_UID=$(stat -c "%u" package.json 2>/dev/null || echo "unknown")
HOST_GID=$(stat -c "%g" package.json 2>/dev/null || echo "unknown")
CONTAINER_UID=$(id -u)
CONTAINER_GID=$(id -g)

if [ "$HOST_UID" != "$CONTAINER_UID" ] || [ "$HOST_GID" != "$CONTAINER_GID" ]; then
  echo "⚠️  UID/GID mismatch: host=$HOST_UID:$HOST_GID vs container=$CONTAINER_UID:$CONTAINER_GID"
  echo "   This could lead to file permission issues. Consider aligning UID:GID using build args."
fi

echo "✅ init.sh finished"
exec "$@"