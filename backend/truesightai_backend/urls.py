from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/audio/', include('audio_service.urls')),
    path('api/video/', include('video_service.urls')),
    path('api/text/', include('text_service.urls')),
]
