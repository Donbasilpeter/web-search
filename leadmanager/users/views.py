import json
import logging
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import auth, User
from django.core import serializers
import humps

import datetime as dt

from leadmanager.platforms import provider_for, PLATFORM_ONLINE_NEWS, PLATFORM_SOURCE_MEDIA_CLOUD


logger = logging.getLogger(__name__)


# search tool
@require_http_methods(["POST"])
def search(request):

    payload = json.loads(request.body)

    query_str = payload.get('query', None)

    start_date = payload.get('start', None)
    start_date = dt.datetime.strptime(start_date, '%Y-%m-%d')

    end_date = payload.get('end', None)
    end_date = dt.datetime.strptime(end_date, '%Y-%m-%d')

    provider = provider_for(PLATFORM_ONLINE_NEWS, PLATFORM_SOURCE_MEDIA_CLOUD)
    total_articles = provider.count(query_str, start_date, end_date)

    return HttpResponse(json.dumps({"count": total_articles}), content_type="application/json")


@require_http_methods(["GET"])
def profile(request):
    if request.user.id is not None:
        data = _serialized_current_user(request)
    else:
        data = json.dumps({'isActive': False})
    return HttpResponse(data, content_type='application/json')


@require_http_methods(["POST"])
def login(request):
    payload = json.loads(request.body)
    user = auth.authenticate(username=payload.get('username', None),
                             password=payload.get('password', None))
    if user is not None:
        logger.debug('logged in success')
        auth.login(request, user)
        data = _serialized_current_user(request)
        return HttpResponse(data, content_type='application/json')
    else:
        logger.debug('user does not exist')
        data = json.dumps({'message': "Unable to login"})
        return HttpResponse(data, content_type='application/json', status=403)


@require_http_methods(["POST"])
def register(request):
    try:
        payload = json.loads(request.body)

        first_name = payload.get('first_name', None)
        last_name = payload.get('last_name', None)
        email = payload.get('email', None)
        username = payload.get('username', None)
        password1 = payload.get('password1', None)
        password2 = payload.get('password2', None)

        # first verify passwords match
        if password1 != password2:
            logging.debug('password not matching')
            data = json.dumps({'message': "Passwords don't match"})
            return HttpResponse(data, content_type='application/json', status=403)

        # next verify email is new
        try:
            user = User.objects.get(email__exact=email)
            logger.debug('Email taken')
            data = json.dumps({'message': "Email already exists"})
            return HttpResponse(data, content_type='application/json', status=403)
        except User.DoesNotExist:
            pass
        # checks out, make a new user
        created_user = User.objects.create_user(username=username, password=password1, email=email,
                                                first_name=first_name, last_name=last_name)
        created_user.save()
        logging.debug('new user created')
        data = json.dumps({'message': "new user created"})
        return HttpResponse(data, content_type='application/json', status=200)
    except Exception as e:
        data = json.dumps({'message': e.message})
        return HttpResponse(data, content_type='application/json', status=400)


@require_http_methods(["POST"])
def logout(request):
    logging.debug('logout success')
    auth.logout(request)
    data = json.dumps({'message': "Logged Out"})
    return HttpResponse(data, content_type='application/json')


def _serialized_current_user(request) -> str:
    current_user = request.user
    serialized_data = serializers.serialize('json', [current_user, ])
    data = json.loads(serialized_data)[0]['fields']
    camelcase_data = humps.camelize(data)
    return json.dumps(camelcase_data)
