from django.contrib import admin

from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("store_name", "owner", "verification_status", "rating", "is_active")
    list_filter = ("verification_status", "is_active")
    search_fields = ("store_name", "owner__email")
    prepopulated_fields = {"slug": ("store_name",)}
