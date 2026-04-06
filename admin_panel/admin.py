from django.contrib import admin

from .models import AbandonedCart, AnalyticsEvent

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
