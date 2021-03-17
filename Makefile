.PHONY: frontend backend

frontend:
	cd frontend; \
	npm start

backend:
	source venv/bin/activate; \
	./manage.py runserver

setup:
	source venv/bin/activate; \
	source ./.env && \
	pip install -r requirements.txt; \
	./manage.py migrate

deploy: setup
	source venv/bin/activate && \
	source ./.env && \
	./manage.py collectstatic && \
	cd frontend && \
	npm run build && \
	sudo systemctl restart nginx