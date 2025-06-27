COMPOSE=docker-compose

## 🟢 Local development
dev:
	$(COMPOSE) up --build

dev-no-build:  ## 🔄 Start dev without rebuilding
	$(COMPOSE) up

dev-down:
	$(COMPOSE) down

## 🔵 Production
prod:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build

prod-down:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down

## 📦 Logs
logs:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f

## 🧹 Cleanup
clean:
	$(COMPOSE) -f docker/docker-compose.yml -f docker/docker-compose.override.yml down --volumes --remove-orphans

## 📋 Show resolved env variables
envcheck:
	$(COMPOSE) config | grep -A50 "environment:" | grep -v "\-\-"
