"""
ASGI config for MTSSummarizerBackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
import asyncio

from django.core.asgi import get_asgi_application
from api.task_queue import task_queue

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MTSSummarizerBackend.settings')

django.setup()
django_application = get_asgi_application()

async def application(scope, receive, send):
    if scope['type'] == 'lifespan':
        await task_queue.start()
        await send({'type': 'lifespan.startup.complete'})
        while True:
            message = await receive()
            if message['type'] == 'lifespan.shutdown':
                break
        await send({'type': 'lifespan.shutdown.complete'})
    else:
        await django_application(scope, receive, send)
