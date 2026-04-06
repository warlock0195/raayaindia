from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="reviews")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "rating"])]

    def __str__(self):
        return f"{self.product.name} - {self.rating}"
