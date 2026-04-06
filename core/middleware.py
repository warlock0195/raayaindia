import json
import logging

from django.http import JsonResponse

logger = logging.getLogger("errors")


class ApiResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
        except Exception as exc:
            if request.path.startswith("/api/v1/"):
                logger.exception("Unhandled API exception: %s", exc)
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Internal server error",
                        "data": {},
                    },
                    status=500,
                )
            raise

        if not request.path.startswith("/api/v1/"):
            return response

        if request.path.startswith("/api/v1/schema/") or request.path.startswith("/api/v1/docs/"):
            return response

        if response.status_code == 204:
            return response

        if "application/json" not in response.get("Content-Type", ""):
            return response

        if hasattr(response, "data"):
            payload = response.data
            if isinstance(payload, dict) and {"success", "message", "data"}.issubset(payload.keys()):
                return response
            response.data = {
                "success": 200 <= response.status_code < 400,
                "message": "Request successful" if response.status_code < 400 else "Request failed",
                "data": payload,
            }
            return response

        try:
            payload = json.loads(response.content.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return response

        if isinstance(payload, dict) and {"success", "message", "data"}.issubset(payload.keys()):
            return response

        wrapped = {
            "success": 200 <= response.status_code < 400,
            "message": "Request successful" if response.status_code < 400 else "Request failed",
            "data": payload,
        }
        response.content = json.dumps(wrapped).encode("utf-8")
        response["Content-Length"] = str(len(response.content))
        return response
