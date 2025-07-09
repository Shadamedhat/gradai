from flask import jsonify
from pymongo import MongoClient
from datetime import datetime
import pandas as pd
from prophet import Prophet
from controllers.ai_utils import classify_feedback

client = MongoClient("mongodb+srv://mo7amednabih:Cpz0xP5eJV0NsLDQ@cluster0.lpj4mo9.mongodb.net/")
db = client["CareDent"]

def get_top_active_students():
    pipeline = [
        {"$match": {"student": {"$ne": None}}},
        {"$group": {"_id": "$student", "appointmentsCount": {"$sum": 1}}},
        {"$sort": {"appointmentsCount": -1}},
        {"$limit": 5},
        {"$lookup": {
            "from": "users",
            "localField": "_id",
            "foreignField": "_id",
            "as": "studentInfo"
        }},
        {"$unwind": "$studentInfo"},
        {"$project": {
            "_id": 0,
            "fullName": "$studentInfo.fullName",
            "appointmentsCount": 1
        }}
    ]
    result = list(db.orderdoctors.aggregate(pipeline))
    return jsonify(result)

def get_ratings_distribution():
    pipeline = [
        {"$group": {"_id": "$ratings", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    result = list(db.reviewstudents.aggregate(pipeline))
    return jsonify(result)

def get_appointments_status():
    total = db.orderdoctors.count_documents({})
    grouped = db.orderdoctors.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ])
    data = [{"status": doc["_id"], "count": doc["count"], "percentage": round((doc["count"]/total)*100, 2)} for doc in grouped]
    return jsonify(data)

def get_treatment_orders_by_month():
    pipeline = [
        {"$project": {
            "type": 1,
            "month": {"$month": "$date"}
        }},
        {"$group": {
            "_id": {"type": "$type", "month": "$month"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.month": 1}}
    ]
    result = list(db.orderdoctors.aggregate(pipeline))
    return jsonify(result)

def treatment_forecast():
    data = list(db.orderdoctors.find({"status": "Completed"}, {"date": 1}))
    df = pd.DataFrame(data)
    df['ds'] = pd.to_datetime(df['date'])
    df['y'] = 1
    df = df.groupby('ds').count().reset_index()[['ds', 'y']]

    m = Prophet()
    m.fit(df)
    future = m.make_future_dataframe(periods=30)
    forecast = m.predict(future)

    return jsonify(forecast[['ds', 'yhat']].tail(30).to_dict(orient='records'))

def analyze_feedback():
    feedbacks = db.reviewstudents.find({}, {"_id": 0, "feedback": 1})
    feedback_texts = [doc['feedback'] for doc in feedbacks if 'feedback' in doc]
    predictions = classify_feedback(feedback_texts)
    return jsonify(predictions)
