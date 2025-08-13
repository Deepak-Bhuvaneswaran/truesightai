import torch
import tempfile
import moviepy.editor as mp
import whisper
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status

whisper_model = whisper.load_model("base")
tokenizer = AutoTokenizer.from_pretrained("roberta-base")  # Replace with fine-tuned if available
roberta_model = AutoModelForSequenceClassification.from_pretrained("roberta-base")
roberta_model.eval()

class VideoCheckView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        video_file = request.FILES.get("file")
        if not video_file:
            return Response({"error": "No video uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Save file to temp, extract audio, transcribe, classify
        with tempfile.NamedTemporaryFile(suffix=".mp4") as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video.flush()
            clip = mp.VideoFileClip(temp_video.name)
            audio_path = temp_video.name + ".wav"
            clip.audio.write_audiofile(audio_path, logger=None)
            transcript = whisper_model.transcribe(audio_path)["text"]
            inputs = tokenizer(transcript, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = roberta_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=1)
                conf, pred = torch.max(probs, dim=1)
            status_label = "Fake" if pred.item() == 1 else "Real"
            return Response({
                "status": status_label,
                "confidence": float(conf.item()),
                "transcript_excerpt": transcript[:200],
                "reasoning": f"RoBERTa on transcript suggests {status_label}"
            })
