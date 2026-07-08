CONDA_ENV = sbk-cv-analyzer
CONDA = conda run -n $(CONDA_ENV) --no-capture-output

.PHONY: local dev backend celery frontend migrate lint format test

local:
	./dev.sh

dev:
	powershell -ExecutionPolicy Bypass -File dev.ps1

backend:
	cd backend && $(CONDA) python run.py

celery:
	cd backend && $(CONDA) celery -A app.tasks.celery_app worker --loglevel=info --pool=solo

frontend:
	cd frontend && rm -rf .next && npm run dev

migrate:
	cd backend && $(CONDA) alembic upgrade head

lint:
	cd backend && $(CONDA) ruff check .

format:
	cd backend && $(CONDA) black .

test:
	cd backend && $(CONDA) pytest
