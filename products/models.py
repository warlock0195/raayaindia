from django.core.validators import MinValueValidator
from django.db import models


class Product(models.Model):
    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.PROTECT, related_name="products")
    category = models.ForeignKey("categories.Category", on_delete=models.PROTECT, related_name="products")
    subcategory = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="subcategory_products",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=120, unique=True)
    tags = models.CharField(max_length=255, blank=True)
    brand = models.CharField(max_length=120, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["sku"]),
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["price"]),
            models.Index(fields=["brand"]),
        ]

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price is not None else self.price

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "id"]
        indexes = [models.Index(fields=["product", "is_primary"])]


class ProductVariant(models.Model):
    class SizeChoices(models.TextChoices):
        S = "S", "S"
        M = "M", "M"
        L = "L", "L"
        XL = "XL", "XL"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size = models.CharField(max_length=10, choices=SizeChoices.choices)
    color = models.CharField(max_length=50)
    variant_stock = models.PositiveIntegerField(default=0)
    sku_suffix = models.CharField(max_length=20, blank=True)

    class Meta:
        unique_together = ("product", "size", "color")
        indexes = [models.Index(fields=["product", "size", "color"])]

    def __str__(self):
        return f"{self.product.name} - {self.size}/{self.color}"
