from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
import google.generativeai as genai  # ✅ Correct


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # or "GOOGLE_API_KEY" if you renamed it

app = Flask(__name__)
CORS(app)

# Optional: Initialize client once (if needed)
# client = genai.Client()

@app.route('/')
def home():
    return jsonify({"message": "FullStack Fitness Backend is running!"})

# ===================================================================================
# 🔥 MAIN INTEGRATION ENDPOINT: Receives user data from React frontend
# ===================================================================================
@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    try:
        # =======================================================================
        # 1️⃣ EXTRACT USER DATA FROM FRONTEND (sent as JSON)
        # =======================================================================
        data = request.get_json()
        
        # Example expected structure (from your React form):
        # {
        #   "gender": "male",
        #   "height": "180",        → string (from HTML input)
        #   "weight": "75",
        #   "daysPerWeek": "4",
        #   "hoursPerDay": "1.5",
        #   "primaryGoal": "muscle gain",
        #   "location": "gym",
        #   "includeCardio": true,
        #   "targetMuscles": ["chest", "arms"]
        # }

        # Convert string numbers to float/int
        def safe_float(val, default=0.0):
            try:
                return float(val) if val not in (None, '') else default
            except (TypeError, ValueError):
                return default

        def safe_int(val, default=0):
            try:
                return int(float(val)) if val not in (None, '') else default
            except (TypeError, ValueError):
                return default

        # Parse data with safety
        gender = data.get('gender', 'other')
        height_cm = safe_float(data.get('height'), 170)
        weight_kg = safe_float(data.get('weight'), 70)
        days_per_week = safe_int(data.get('daysPerWeek'), 3)
        hours_per_day = safe_float(data.get('hoursPerDay'), 1.0)
        primary_goal = data.get('primaryGoal', 'general fitness')
        location = data.get('location', 'gym')
        include_cardio = bool(data.get('includeCardio', False))
        target_muscles = data.get('targetMuscles') or ['full body']

        # =======================================================================
        # 2️⃣ CALCULATE DAILY NUTRITION (Macros) USING MIFLIN-ST JOR EQUATION
        #    (Assume age = 25, activity level = "moderately active" for hackathon)
        # =======================================================================
        age = 25  # ← Default for hackathon; could be added to form later
        activity_multiplier = 1.55  # Moderately active

        # Mifflin-St Jeor BMR
        if gender == 'female':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        else:  # male or other
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

        daily_calories = bmr * activity_multiplier

        # Macro split based on goal
        if primary_goal == 'muscle gain':
            protein_g = weight_kg * 2.2      # ~2.2g/kg
            fat_g = daily_calories * 0.25 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4
        elif primary_goal == 'fat loss':
            protein_g = weight_kg * 2.2
            fat_g = daily_calories * 0.30 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4
        else:  # general fitness / endurance
            protein_g = weight_kg * 1.6
            fat_g = daily_calories * 0.25 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4

        # Round values
        daily_calories = round(daily_calories)
        protein_g = round(protein_g)
        fat_g = round(fat_g)
        carb_g = max(0, round(carb_g))  # Avoid negative carbs

        nutrition_guide = f"""Daily Nutrition Guide:
- Calories: {daily_calories} kcal
- Protein: {protein_g}g
- Carbohydrates: {carb_g}g
- Fats: {fat_g}g
- Micronutrients: Focus on iron, vitamin D, magnesium, and calcium based on your diet.
"""

        # =======================================================================
        # 3️⃣ GENERATE WORKOUT ROUTINE USING GEMINI API
        #    Craft a detailed prompt using all user inputs
        # =======================================================================
        muscle_list = ', '.join(target_muscles) if target_muscles else 'full body'
        cardio_text = "Include cardio sessions." if include_cardio else "Do not include cardio."
        equipment = "gym equipment (barbells, machines, etc.)" if location == 'gym' else "minimal home equipment (dumbbells, resistance bands, bodyweight)"

        prompt = f"""
Generate a detailed 7-day workout plan for a fitness app user with the following profile:
- Gender: {gender}
- Height: {height_cm} cm
- Weight: {weight_kg} kg
- Primary Goal: {primary_goal}
- Days per week available: {days_per_week}
- Hours per day available: {hours_per_day}
- Target muscle groups: {muscle_list}
- Equipment access: {equipment}
- Cardio preference: {cardio_text}

Requirements:
- Provide a plan for exactly 7 days (Monday to Sunday).
- Each day should include: workout focus, exercises, sets, reps, and brief instructions.
- Keep workouts within the user's time limit per day.
- Use clear, motivational language.
- Do not include nutrition advice (that's handled separately).
- Format as plain text with clear day headings (e.g., "Monday: ...").
"""

        # Call Gemini API
        # Note: Use `genai.models.generate_content` (not client.models...)
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content(prompt)
        workout_routine = response.text

        # =======================================================================
        # 4️⃣ RETURN BOTH ROUTINE AND NUTRITION TO FRONTEND
        # =======================================================================
        return jsonify({
            "success": True,
            "routine": workout_routine,
            "nutrition": nutrition_guide
        })

    except Exception as e:
        print("Error in generate_plan:", str(e))
        return jsonify({
            "success": False,
            "message": "Failed to generate plan. Please try again."
        }), 500

# ===================================================================================
# 🚀 RUN SERVER
# ===================================================================================
if __name__ == '__main__':
    print("🚀 FullStack Fitness Backend Starting...")
    app.run(host='0.0.0.0', port=8000, debug=True)