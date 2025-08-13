import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status

# Load tokenizer and model once at startup
tokenizer = AutoTokenizer.from_pretrained("roberta-base")  # Replace with your fine-tuned model path if available
text_model = AutoModelForSequenceClassification.from_pretrained("roberta-base")
text_model.eval()

class TextCheckView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        # Get uploaded file
        text_file = request.FILES.get('file')
        if not text_file:
            return Response({"error": "No text file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Read file content
        try:
            content = text_file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return Response({"error": f"Could not read file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Tokenize with truncation to handle long files
        inputs = tokenizer(content, return_tensors="pt", truncation=True, max_length=512)

        # Run inference
        with torch.no_grad():
            outputs = text_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            conf, pred = torch.max(probs, dim=1)

        status_label = "Fake" if pred.item() == 1 else "Real"

        # Return prediction
        return Response({
            "status": status_label,
            "confidence": float(conf.item()),
            "reasoning": f"Text classification says {status_label}"
        })
