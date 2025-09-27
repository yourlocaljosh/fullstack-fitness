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
  const navigate = useNavigate(); // ← Add navigation hook

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        navigate('/results'); // ← This triggers the navigation!
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

  // ... rest of your HomePage component (unchanged) ...
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
              <div className="slider-ticks days-ticks">
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
                value={formData.primaryGoal}
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
                value={formData.location}
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
                  checked={formData.includeCardio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    includeCardio: e.target.checked
                  }))}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <label className="dropdown-label">
              Favorite Muscle Groups:
              <select
                multiple
                value={formData.targetMuscles}
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