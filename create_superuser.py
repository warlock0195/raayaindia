import os

from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


def create_superuser() -> None:
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@raayaindia.com")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "Admin@123")
    username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
    name = os.getenv("DJANGO_SUPERUSER_NAME", "Admin")

    try:
        user_model = get_user_model()
        user_model.objects.count()
    except (OperationalError, ProgrammingError) as exc:
        print(f"[create_superuser] Database not ready yet: {exc}")
        return

    try:
        username_field = user_model.USERNAME_FIELD
        identifier = email if username_field == "email" else username
        lookup = {username_field: identifier}

        if user_model.objects.filter(**lookup).exists():
            print(f"[create_superuser] Superuser already exists: {identifier}")
            return

        create_kwargs = {
            username_field: identifier,
            "password": password,
        }

        model_fields = {field.name for field in user_model._meta.fields}
        if "email" in model_fields and username_field != "email":
            create_kwargs["email"] = email
        if "name" in model_fields:
            create_kwargs["name"] = name

        print(f"[create_superuser] Creating superuser: {identifier}")
        user_model.objects.create_superuser(**create_kwargs)
        print(f"[create_superuser] Superuser created: {identifier}")
    except Exception as exc:
        print(f"[create_superuser] Skipped due to unexpected error: {exc}")
