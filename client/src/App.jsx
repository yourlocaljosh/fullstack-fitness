import React, { useState } from 'react';
import './styles/App.css';

function App() {
  const [formData, setFormData] = useState({
    gender: '',
    height: '',
    weight: '',
    daysPerWeek: 4,        // ← default to 4 days
    hoursPerDay: 1,        // ← default to 1 hour
    primaryGoal: '',
    location: '',
    includeCardio: false,
    targetMuscles: []
  });

  const [routine, setRoutine] = useState('');
  const [nutrition, setNutrition] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setRoutine(data.routine);
        setNutrition(data.nutrition);
      } else {
        alert('Error generating plan: ' + data.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Network error. Is the backend running?');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>FullStack Fitness</h1>
        <p>Your AI-Powered Personal Fitness & Nutrition Coach</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <section className="input-section">
            <h2>Your Info</h2>
            
            <label>
              Gender:
              <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Height (cm):
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="0"
                max="5000"
                required
              />
            </label>

            <label>
              Weight (kg):
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                max="5000"
                required
              />
            </label>

            <label className="slider-label">
              Workout Days Per Week: <span className="slider-value">{formData.daysPerWeek || 0}</span>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                name="daysPerWeek"
                value={formData.daysPerWeek || 1}
                onChange={handleInputChange}
                className="slider"
              />
              <div className="slider-ticks">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </label>

            <label className="slider-label">
              Hours Per Day: <span className="slider-value">{formData.hoursPerDay ? parseFloat(formData.hoursPerDay).toFixed(2) : '0.00'}</span>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                name="hoursPerDay"
                value={formData.hoursPerDay || 0.25}
                onChange={handleInputChange}
                className="slider"
              />
              <div className="slider-ticks">
                <span>0.25</span>
                <span>0.5</span>
                <span>1</span>
                <span>1.5</span>
                <span>2</span>
                <span>2.5</span>
                <span>3</span>
              </div>
            </label>
          </section>

          <section className="goals-section">
            <h2>Preferences</h2>

            <label className="dropdown-label">
              Primary Goal:
              <select
                name="primaryGoal"
                value={formData.primaryGoal || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Goal</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="fat loss">Fat Loss</option>
                <option value="improved endurance">Endurance</option>
                <option value="general fitness">General Fitness</option>
              </select>
            </label>

            <label className="dropdown-label">
              Workout Location:
              <select
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Location</option>
                <option value="home">Home (Minimal Equipment)</option>
                <option value="gym">Gym (Full Equipment)</option>
              </select>
            </label>

            <label className="toggle-label">
              Include Cardio?
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  name="includeCardio"
                  checked={!!formData.includeCardio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    includeCardio: e.target.checked
                  }))}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <label className="dropdown-label">
              Target Muscle Groups:
              <select
                multiple
                value={formData.targetMuscles || []}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData(prev => ({ ...prev, targetMuscles: options }));
                }}
                className="multi-select"
              >
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="legs">Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
                <option value="full body">Full Body</option>
              </select>
            </label>
          </section>

          <button type="submit">Generate My Plan</button>
        </form>

        {routine && (
          <section className="results-section">
            <h2>Weekly Workout Routine</h2>
            <pre className="routine">{routine}</pre>
          </section>
        )}

        {nutrition && (
          <section className="results-section">
            <h2>Daily Nutrition Guide</h2>
            <pre className="nutrition">{nutrition}</pre>
          </section>
        )}
      </main>

      <footer>
        <p>Powered by Gemini AI • Built for MHacks 2025</p>
      </footer>
    </div>
  );
}

export default App;