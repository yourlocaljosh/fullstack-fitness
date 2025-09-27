import React from 'react';
import './styles/App.css';

function ResultsPage({ routine, nutrition }) {
  if (!routine || !nutrition) {
    // Redirect to home if no data (user navigated directly)
    window.location.href = '/';
    return null;
  }

  // Clean up Gemini's output (remove extra newlines)
  const cleanRoutine = routine
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('\n');

  const cleanNutrition = nutrition
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('\n');

  return (
    <div className="results-container">
      <header className="results-header">
        <h1>Your Personalized Plan</h1>
        <button 
          onClick={() => window.history.back()} 
          className="back-button"
        >
          ← Back to Form
        </button>
      </header>

      <main className="results-main">
        <section className="workout-section">
          <h2>📅 Weekly Workout Routine</h2>
          <div className="routine-content">
            {cleanRoutine.split('\n').map((line, i) => {
              // Style day headers differently
              if (line.toLowerCase().includes('monday') || 
                  line.toLowerCase().includes('tuesday') || 
                  line.toLowerCase().includes('wednesday') || 
                  line.toLowerCase().includes('thursday') || 
                  line.toLowerCase().includes('friday') || 
                  line.toLowerCase().includes('saturday') || 
                  line.toLowerCase().includes('sunday')) {
                return <h3 key={i} className="day-header">{line}</h3>;
              }
              return <p key={i} className="routine-line">{line}</p>;
            })}
          </div>
        </section>

        <section className="nutrition-section">
          <h2>🥗 Daily Nutrition Guide</h2>
          <div className="nutrition-content">
            {cleanNutrition.split('\n').map((line, i) => (
              <p key={i} className="nutrition-line">{line}</p>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>Powered by Gemini AI • Built for MHacks 2025</p>
      </footer>
    </div>
  );
}

export default ResultsPage;