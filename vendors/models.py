from django.db import models


class Vendor(models.Model):
    owner = models.OneToOneField("users.User", on_delete=models.CASCADE, related_name="vendor_profile")
    store_name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=280, unique=True)
    verification_status = models.BooleanField(default=False, db_index=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["store_name"]
        indexes = [
            models.Index(fields=["store_name"]),
            models.Index(fields=["verification_status"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.store_name
