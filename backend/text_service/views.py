import random
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

# ---- Fake AI model responses ----
SAMPLE_OUTPUTS = [
    {
        "status": "Real",
        "confidence": 0.92,
        "reasoning": "Content matches human-generated patterns"
    },
    {
        "status": "Fake",
        "confidence": 0.84,
        "reasoning": "Detected AI-generated linguistic artifacts"
    },
    {
        "status": "Real",
        "confidence": 0.97,
        "reasoning": "Authentic human voice characteristics"
    },
    {
        "status": "Fake",
        "confidence": 0.78,
        "reasoning": "Unnatural phrasing and semantic inconsistencies detected"
    },
    {
        "status": "Real",
        "confidence": 0.88,
        "reasoning": "Pronunciation and intonation match native speaker patterns"
    },
    {
        "status": "Fake",
        "confidence": 0.91,
        "reasoning": "Overly uniform speech rhythm characteristic of synthetic generation"
    },
    {
        "status": "Real",
        "confidence": 0.95,
        "reasoning": "Evidence of legitimate capture artifacts and background noise"
    },
    {
        "status": "Fake",
        "confidence": 0.82,
        "reasoning": "Detected suspicious repetition of certain linguistic structures"
    },
    {
        "status": "Real",
        "confidence": 0.90,
        "reasoning": "Syntactic and semantic variety consistent with human authorship"
    },
    {
        "status": "Fake",
        "confidence": 0.87,
        "reasoning": "Found irregular pitch contours typical in cloned voice outputs"
    }
]

def fake_model_response():
    return random.choice(SAMPLE_OUTPUTS)

# ---- API endpoint ----
class TextCheckView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        # We don't do any real model inference here — just send a fake output
        return Response(fake_model_response())
