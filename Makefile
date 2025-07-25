COMPOSE=docker compose

## 🟢 Local development
dev-local:
	$(COMPOSE) -f docker/docker-compose.infra.yml up -d && npm run dev

dev-local-down:
	$(COMPOSE) -f docker/docker-compose.infra.yml down

dev:
	USER_ID=`id -u` GROUP_ID=`id -g` $(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.override.yml up --build

dev-tls:
	USER_ID=`id -u` GROUP_ID=`id -g` $(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.override.yml -f docker/docker-compose.tls-override.yml up --build

dev-down:
	USER_ID=`id -u` GROUP_ID=`id -g` $(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.override.yml down

## 🔵 Production
prod-no-cache:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml build --no-cache
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d

prod:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build

prod-down:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down

## 📦 Logs
logs:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f

## 📦 Logs
logs-infra:
	$(COMPOSE) -f docker/docker-compose.infra.yml logs -f

## 🧹 Cleanup
clean:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.override.yml down --volumes --remove-orphans

## 📋 Show resolved env variables
envcheck:
	$(COMPOSE) config | grep -A50 "environment:" | grep -v "\-\-"
