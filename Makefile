.PHONY: setup up down logs build shell-backend shell-frontend clean

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file. Please edit it with your configuration."; \
	else \
		echo ".env file already exists."; \
	fi

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

clean:
	docker compose down -v
