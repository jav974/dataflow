#!/bin/bash

cleanup() {
  if command -v mutagen >/dev/null; then
    echo "🛑 Stopping Mutagen sync..."
    mutagen project terminate --project-file docker/mutagen.yml || true
  fi
}
trap cleanup EXIT

# 📝 Parse arguments
ENABLE_TLS=false
for arg in "$@"; do
  case $arg in
    --tls)
      ENABLE_TLS=true
      shift
      ;;
  esac
done

[ -d node_modules ] || mkdir node_modules

if command -v mutagen >/dev/null; then
  echo "⚡ Detected Mutagen – starting faster sync..."
  mutagen project start --project-file docker/mutagen.yml
fi

# 🐳 Build with TLS option
COMPOSE_FILES="-f docker/docker-compose.yml -f docker/docker-compose.override.yml"
[ "$ENABLE_TLS" = true ] && COMPOSE_FILES="$COMPOSE_FILES -f docker/docker-compose.tls-override.yml"

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
docker compose $COMPOSE_FILES up --build
