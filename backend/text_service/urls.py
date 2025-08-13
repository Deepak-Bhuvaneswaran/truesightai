from django.urls import path
from .views import TextCheckView

urlpatterns = [
    path('text-check/', TextCheckView.as_view()),
]
