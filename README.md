# Quiz App

## Technologies used

1. React (Frontend)
2. Redux (State Management)
3. Tailwind CSS (Utility based CSS Framework)
4. Django / Django REST Framework

## Installation

```bash
git clone
cd quiz
virtualenv venv
make setup
```

### Sample nginx configurations
```nginx
server {
    listen 8080;
    location /api/ {
        uwsgi_pass unix:/tmp/quiz.sock;
        include uwsgi_params;
    }
    location /api/static/ {
        alias /var/www/quiz/static/;
    }
}

upstream api {
    server localhost:8080;
}
server {
    server_name ahmadbilal.ungleich.cloud;
    listen [::]:80;
    listen *:80;
    root /var/www/build;

    location /api/ {
        include proxy_params;
        proxy_pass http://api;
    }
    location / {
        try_files $uri /index.html;
    }
}
```
