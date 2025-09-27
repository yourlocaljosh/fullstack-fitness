import React from 'react';
import './styles/App.css';

function ResultsPage({ routine, nutrition }) {
  if (!routine || !nutrition) {
    window.location.href = '/';
    return null;
  }

  const formatRoutine = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const formatted = [];
    let currentDay = null;

    for (const line of lines) {
      const dayMatch = line.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (dayMatch) {
        currentDay = line;
        formatted.push(`\n${currentDay}:`);
      } 
      else if (line.match(/\(\s*\d+\s*sets?:?\s*\d+(-\d+)?\s*reps?\s*\)/i)) {
        if (currentDay) {
          formatted.push(`- ${line}`);
        }
      }
    }
    
    return formatted.join('\n').trim();
  };

  const cleanRoutine = formatRoutine(routine);
  const cleanNutrition = nutrition
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.includes('Daily Nutrition Guide:'))
    .join('\n');

  return (
    <div className="results-container">
      <header className="results-header">
        <h1>💪 Your Personalized Plan</h1>
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
            <pre className="formatted-routine">{cleanRoutine}</pre>
          </div>
        </section>

        <section className="nutrition-section">
          <h2>🥗 Daily Nutrition Guide</h2>
          <div className="nutrition-content">
            <pre className="formatted-nutrition">{cleanNutrition}</pre>
          </div>
        </section>
      </main>

      <footer>
        <p>Powered by 🤖 Gemini AI • Built for MHacks 2025</p>
      </footer>
    </div>
  );
}

export default ResultsPage;