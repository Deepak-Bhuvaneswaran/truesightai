from django.urls import path
from .views import AudioCheckView

urlpatterns = [
    path('audio-check/', AudioCheckView.as_view()),
]
