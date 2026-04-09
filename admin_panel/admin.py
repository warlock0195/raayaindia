from django.contrib import admin
from django.utils.html import format_html

from .models import AbandonedCart, AnalyticsEvent, HeroBanner, HomeSection, SiteSettings

admin.site.site_header = "Raaya India Admin"
admin.site.site_title = "Raaya India Admin Portal"
admin.site.index_title = "Operations Dashboard"


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "session_id", "user", "product", "order", "created_at")
    list_filter = ("event_type", "created_at")
    search_fields = ("session_id", "user__email", "path")


@admin.register(AbandonedCart)
class AbandonedCartAdmin(admin.ModelAdmin):
    list_display = ("user", "is_converted", "reminder_status", "last_activity")
    list_filter = ("is_converted", "reminder_status")
    search_fields = ("user__email",)


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "image_preview", "button_text", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title", "subtitle", "button_text", "button_link")
    list_editable = ("is_active",)
    readonly_fields = ("image_preview", "created_at", "updated_at")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height: 72px; width: 120px; object-fit: cover; border: 1px solid #ddd;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Image"


@admin.register(HomeSection)
class HomeSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "order", "section_type", "image_preview", "is_active", "updated_at")
    list_filter = ("is_active", "section_type")
    search_fields = ("title", "subtitle", "button_text", "button_link")
    list_editable = ("order", "is_active")
    ordering = ("order", "id")
    readonly_fields = ("image_preview", "created_at", "updated_at")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height: 72px; width: 120px; object-fit: cover; border: 1px solid #ddd;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Image"


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "contact_email", "whatsapp_number", "updated_at")
    readonly_fields = ("logo_preview", "updated_at")

    def has_add_permission(self, request):
        if SiteSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def logo_preview(self, obj):
        if obj and obj.logo:
            return format_html(
                '<img src="{}" style="height: 64px; width: 64px; object-fit: cover; border: 1px solid #ddd;" />',
                obj.logo.url,
            )
        return "No logo"

    logo_preview.short_description = "Logo"
