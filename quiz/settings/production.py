import os

from .base import *  # noqa: F403, F401

env = os.environ.copy()

ALLOWED_HOSTS = env.get("ALLOWED_HOSTS", " ").split(",") + ["api", "localhost"]
DEBUG = env.get("DEBUG", False)
SECRET_KEY = env.get("SECRET_KEY")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env.get('DATABASE_NAME', 'app'),
        'USER': 'app',
    }
}

# STATIC_ROOT = "/var/www/quiz/static"
# STATIC_URL = "/api/static/"



try:
    from .local import *  # noqa: F403, F401
except ImportError:
    pass
