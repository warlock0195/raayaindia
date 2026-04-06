from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is None:
        return None

    if isinstance(response.data, dict):
        message = response.data.get("detail") or "Request failed"
        payload = {k: v for k, v in response.data.items() if k != "detail"}
    else:
        message = "Request failed"
        payload = response.data

    response.data = {
        "success": False,
        "message": str(message),
        "data": payload,
    }
    return response
