from django.urls import path
from .views import VideoCheckView

urlpatterns = [
    path('video-check/', VideoCheckView.as_view()),
]
