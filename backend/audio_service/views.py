import torch
import torchaudio
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification

# Load model ONCE at service start/global scope
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
audio_model = Wav2Vec2ForSequenceClassification.from_pretrained("facebook/wav2vec2-base-960h")
audio_model.eval()

class AudioCheckView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        audio_file = request.FILES.get('file')
        if not audio_file:
            return Response({"error": "No audio uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Load audio
        waveform, sample_rate = torchaudio.load(audio_file)
        inputs = processor(waveform.squeeze().numpy(), sampling_rate=sample_rate, return_tensors="pt", padding=True)

        with torch.no_grad():
            outputs = audio_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            conf, pred = torch.max(probs, dim=1)

        status_label = "Fake" if pred.item() == 1 else "Real"
        return Response({
            "status": status_label,
            "confidence": float(conf.item())
        })
