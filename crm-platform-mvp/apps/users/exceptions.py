from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'status_code': response.status_code,
            'error': None,
            'detail': None,
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['detail'] = str(response.data['detail'])
            else:
                error_data['error'] = response.data
        elif isinstance(response.data, list):
            error_data['error'] = response.data
        else:
            error_data['detail'] = str(response.data)

        response.data = error_data

    return response