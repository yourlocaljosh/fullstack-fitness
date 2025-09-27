from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "FullStack Fitness Backend is running!"})

# MAIN INTEGRATION ENDPOINT: Receives user data from React frontend
@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    try:
        # EXTRACT USER DATA FROM FRONTEND (sent as JSON)
        data = request.get_json()

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

        # Parse data with safety (IMPERIAL UNITS FROM FRONTEND)
        gender = data.get('gender', 'other')
        height_in = safe_float(data.get('height'), 68)    # Default: 5'8" (68 inches)
        weight_lbs = safe_float(data.get('weight'), 170)  # Default: 170 lbs
        
        # Validate and clamp imperial values
        if height_in < 24 or height_in > 108:  # Below 2ft or above 9ft
            height_in = 67  # 5'7"
        if weight_lbs < 30 or weight_lbs > 1000:  # Below 30lbs or above 1000lbs
            weight_lbs = 160
        
        # CONVERT IMPERIAL → METRIC for calculations
        height_cm = height_in * 2.54
        weight_kg = weight_lbs * 0.45359237

        days_per_week = safe_int(data.get('daysPerWeek'), 3)
        hours_per_day = safe_float(data.get('hoursPerDay'), 1.0)
        primary_goal = data.get('primaryGoal', 'general fitness')
        location = data.get('location', 'gym')
        include_cardio = bool(data.get('includeCardio', False))
        target_muscles = data.get('targetMuscles') or ['full body']

        # CALCULATE DAILY NUTRITION (Macros) USING MIFLIN-ST JOR EQUATION
        age = 25
        activity_multiplier = 1.55

        # Mifflin-St Jeor BMR
        if gender == 'female':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        else:  # male or other
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

        daily_calories = bmr * activity_multiplier

        # Macro split based on goal
        if primary_goal == 'muscle gain':
            protein_g = weight_kg * 2.2
            fat_g = daily_calories * 0.25 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4
        elif primary_goal == 'fat loss':
            protein_g = weight_kg * 2.2
            fat_g = daily_calories * 0.30 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4
        else:
            protein_g = weight_kg * 1.6
            fat_g = daily_calories * 0.25 / 9
            carb_g = (daily_calories - (protein_g * 4 + fat_g * 9)) / 4

        # Round values
        daily_calories = round(daily_calories)
        protein_g = round(protein_g)
        fat_g = round(fat_g)
        carb_g = max(0, round(carb_g))

        nutrition_guide = f"""Daily Nutrition Guide:
                            - Calories: {daily_calories} calories
                            - Protein: {protein_g}g
                            - Carbohydrates: {carb_g}g
                            - Fats: {fat_g}g
                            """

        # Craft a detailed prompt using all user inputs
        muscle_list = ', '.join(target_muscles) if target_muscles else 'full body'
        cardio_text = "Include cardio sessions." if include_cardio else "Do not include cardio."
        equipment = "gym equipment" if location == 'gym' else "home equipment, prioritizing bodyweight exercises"

        prompt = f"""
            Generate a detailed workout plan for an individual with the following profile:
            - Gender: {gender}
            - Height: {height_in}" ({height_cm:.0f} cm)
            - Weight: {weight_lbs} lbs ({weight_kg:.0f} kg)
            - Primary Goal: {primary_goal}
            - Days per week to have a workout: {days_per_week} (other days should be designated as Rest Days)
            - Hours per working days to spend working out: {hours_per_day}
            - User's favorite muscle groups: {muscle_list}
            - Home or gym preference: {equipment}
            - Cardio preference: {cardio_text}

            STRICT OUTPUT FORMAT - FOLLOW EXACTLY:
            Monday:
            - Exercise Name (X sets: X-X reps)
            - Exercise Name (X sets: X-X reps)

            Tuesday:
            - Exercise Name (X sets: X-X reps)
            - Exercise Name (X sets: X-X reps)

            Wednesday:
            - Rest Day

            [Continue for all 7 days]

            RULES:
            - Start each day with "DayName:" (e.g., "Monday:")
            - If the user selects less than 1 hour, choose 2-3 exercises per day.
            - If the user selects 1-2 hours, choose 4-6 exercises per day.
            - If the user selects more than 2 hours, choose 6-7 exercises per day.
            - The user's favorite muscle groups should be prioritized at least twice per week, with either 2-3 exercises dedicated to it on specific days..
            - Each exercise must start with "- "
            - Include sets and reps in parentheses like "(4 sets: 8-10 reps)"
            - NO additional text, descriptions, or explanations
            - Keep it minimal and clean
            - Do not include any cardio unless the user has specifically requested it.
            - Ensure the plan is feasible given the user's time constraints and equipment access.
            - Ensure the plan is balanced and targets all major muscle groups throughout the week, with emphasis on a favorite if they selected one.
            - Use common exercise names that are widely recognized.
            - Ensure proper punctuation and capitalization.
            - NO days should be empty. For rest days, explicitly write "Rest Day".
            - If the user selects more than 3 favorite muscle groups, only consider the first 3.
            """

        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content(prompt)
        workout_routine = response.text

        # RETURN BOTH ROUTINE AND NUTRITION TO FRONTEND
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

# RUN SERVER
if __name__ == '__main__':
    print("🚀 FullStack Fitness Backend Starting...")
    app.run(host='0.0.0.0', port=8000, debug=True)