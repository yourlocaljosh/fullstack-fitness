import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/App.css';
import ResultsPage from './ResultsPage';

// Custom hook to manage navigation and state
const useResults = () => {
  const [results, setResults] = useState(null);
  
  const setResultsAndNavigate = (routine, nutrition) => {
    setResults({ routine, nutrition });
  };
  
  return { results, setResultsAndNavigate };
};

function HomePage({ onGeneratePlan }) {
  const [formData, setFormData] = useState({
    gender: '',
    height: '',
    weight: '',
    daysPerWeek: 4,
    hoursPerDay: 1,
    primaryGoal: '',
    location: '',
    includeCardio: false,
    targetMuscles: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Primary Goal selection (single choice)
  const handlePrimaryGoalSelect = (goal) => {
    setFormData(prev => ({ ...prev, primaryGoal: goal }));
  };

  // Handle Location selection (single choice)
  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  // Handle Cardio toggle
  const handleCardioToggle = () => {
    setFormData(prev => ({ ...prev, includeCardio: !prev.includeCardio }));
  };

  // Handle Muscle Groups selection (multi-select)
  const handleMuscleGroupToggle = (muscle) => {
    setFormData(prev => {
      const current = prev.targetMuscles || [];
      if (current.includes(muscle)) {
        return { ...prev, targetMuscles: current.filter(m => m !== muscle) };
      } else {
        return { ...prev, targetMuscles: [...current, muscle] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        onGeneratePlan(data.routine, data.nutrition);
        navigate('/results');
      } else {
        alert('Error generating plan: ' + data.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Network error. Is the backend running?');
    } finally {
      setLoading(false);
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
              Height (in):
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="0"
                max="99999"
                required
                placeholder="e.g. 70"
              />
            </label>

            <label>
              Weight (lbs):
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                max="99999"
                required
                placeholder="e.g. 180"
              />
            </label>

            <label className="slider-label">
              Workout Days Per Week: <span className="slider-value">{formData.daysPerWeek}</span>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                name="daysPerWeek"
                value={formData.daysPerWeek}
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
              Hours Per Day: <span className="slider-value">{parseFloat(formData.hoursPerDay).toFixed(2)}</span>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                name="hoursPerDay"
                value={formData.hoursPerDay}
                onChange={handleInputChange}
                className="slider"
              />
              <div className="slider-ticks hours-ticks">
                <span style={{left: '0%'}}>0.25</span>
                <span style={{left: '16.66%'}}>0.5</span>
                <span style={{left: '33.33%'}}>1</span>
                <span style={{left: '50%'}}>1.5</span>
                <span style={{left: '66.66%'}}>2</span>
                <span style={{left: '83.33%'}}>2.5</span>
                <span style={{left: '100%'}}>3</span>
              </div>
            </label>
          </section>

          <section className="goals-section">
            <h2>Preferences</h2>

            {/* Primary Goal - Box Selection */}
            <div className="selection-group">
              <h3 className="selection-label">Primary Goal</h3>
              <div className="box-grid">
                {[
                  { value: 'muscle gain', label: '💪 Muscle Gain' },
                  { value: 'fat loss', label: '🔥 Fat Loss' },
                  { value: 'improved endurance', label: '🏃 Endurance' },
                  { value: 'general fitness', label: '🏋️ General Fitness' }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    className={`selection-box ${formData.primaryGoal === goal.value ? 'selected' : ''}`}
                    onClick={() => handlePrimaryGoalSelect(goal.value)}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Location - Two-Box Switch */}
            <div className="selection-group">
              <h3 className="selection-label">Workout Location</h3>
              <div className="box-pair">
                <button
                  type="button"
                  className={`selection-box ${formData.location === 'home' ? 'selected' : ''}`}
                  onClick={() => handleLocationSelect('home')}
                >
                  🏠 Home
                </button>
                <button
                  type="button"
                  className={`selection-box ${formData.location === 'gym' ? 'selected' : ''}`}
                  onClick={() => handleLocationSelect('gym')}
                >
                  🏋️ Gym
                </button>
              </div>
            </div>

            {/* Include Cardio - Toggle Switch */}
            <div className="selection-group">
              <h3 className="selection-label">Include Cardio?</h3>
              <div className="cardio-toggle" onClick={handleCardioToggle}>
                <div className={`toggle-box ${formData.includeCardio ? 'selected-left' : 'selected-right'}`}>
                  <span className={`toggle-option ${formData.includeCardio ? 'active' : ''}`}>Yes</span>
                  <span className={`toggle-option ${!formData.includeCardio ? 'active' : ''}`}>No</span>
                </div>
              </div>
            </div>

            {/* Muscle Groups - Grid Selection */}
            <div className="selection-group">
              <h3 className="selection-label">Favorite Muscle Groups</h3>
              <div className="muscle-grid">
                {[
                  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full body'
                ].map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    className={`selection-box muscle-box ${formData.targetMuscles.includes(muscle) ? 'selected' : ''}`}
                    onClick={() => handleMuscleGroupToggle(muscle)}
                  >
                    {muscle === 'chest' && 'pectorals'}
                    {muscle === 'back' && 'back'}
                    {muscle === 'legs' && 'legs'}
                    {muscle === 'shoulders' && 'delts'}
                    {muscle === 'arms' && 'arms'}
                    {muscle === 'core' && 'abs'}
                    {muscle === 'full body' && 'full body'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating Your Plan...
              </>
            ) : (
              "Generate My Plan"
            )}
          </button>
        </form>
      </main>

      <footer>
        <p>Powered by Gemini AI • Built for MHacks 2025</p>
      </footer>
    </div>
  );
}

// Main app component that holds state and handles routing
function AppContent() {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleGeneratePlan = (routine, nutrition) => {
    setResults({ routine, nutrition });
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePage onGeneratePlan={handleGeneratePlan} />} 
      />
      <Route 
        path="/results" 
        element={
          <ResultsPage 
            routine={results?.routine} 
            nutrition={results?.nutrition} 
            onBack={() => navigate('/')}
          /> 
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;