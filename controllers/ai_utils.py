from transformers import pipeline

# Initialize BERT sentiment pipeline
sentiment_pipeline = pipeline("sentiment-analysis")

def classify_feedback(feedback_texts):
    results = sentiment_pipeline(feedback_texts)
    mapped = []
    for result in results:
        label = result['label']
        if label == "POSITIVE":
            rating = 5
        elif label == "NEGATIVE":
            rating = 1
        else:
            rating = 3
        mapped.append({
            "label": label,
            "score": result["score"],
            "predicted_rating": rating
        })
    return mapped
