#!/bin/bash

if command -v mutagen >/dev/null; then
  echo "⚡ Detected Mutagen – starting faster sync..."
  mutagen project start --project-file docker/mutagen.yml
fi

export USER_ID=$(id -u)
export GROUP_ID=$(id -g)
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

if command -v mutagen >/dev/null; then
  echo "🛑 Stopping Mutagen sync..."
  mutagen project terminate --project-file docker/mutagen.yml || true
fi
