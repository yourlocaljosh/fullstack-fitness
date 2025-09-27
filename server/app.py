from flask import Flask, jsonify
from google import genai
from google.genai import types

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Server is running!"})

if __name__ == '__main__':
    app.run(debug=True)


print("APP IS RUNNING \n\n\n\n\n\n\n\n\n\n\n.")

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="FullStack Fitness is a web application designed for a hackathon that serves as a personalized AI-driven fitness and nutrition coach. The goal is to provide users with a weekly workout plan and daily macro/micronutrient recommendations based on their specific fitness objectives and personal metrics. This project will demonstrate a full-stack architecture, utilizing a React & CSS front end for an intuitive user experience and a Python backend to handle the core logic and API integrations.",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=-1)
        # Turn off thinking:
        # thinking_config=types.ThinkingConfig(thinking_budget=0)
        # Turn on dynamic thinking:
        # thinking_config=types.ThinkingConfig(thinking_budget=-1)
    )
)

print(response.text)

print("APP IS COMPLETE \n\n\n\n\n\n\n\n\n\n\n.")