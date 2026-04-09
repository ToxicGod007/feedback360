import React from 'react';

export default function Dashboard({ feedbacks, onClear }) {
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0
    ? (feedbacks.reduce((sum, f) => sum + Number(f.rating), 0) / totalFeedbacks).toFixed(1)
    : 0;

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach(f => {
    ratingCounts[f.rating] = (ratingCounts[f.rating] || 0) + 1;
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        {totalFeedbacks > 0 && (
          <button onClick={onClear} className="btn-clear">Clear Data</button>
        )}
      </div>
      
      <div className="summary-cards">
        <div className="card">
          <h3>Total Responses</h3>
          <p>{totalFeedbacks}</p>
        </div>
        <div className="card">
          <h3>Average Rating</h3>
          <p>{averageRating} / 5</p>
        </div>
      </div>

      <h3>Rating Distribution</h3>
      <div className="chart-container">
        {[5, 4, 3, 2, 1].map(star => {
          const count = ratingCounts[star];
          const percentage = totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0;
          return (
            <div key={star} className="chart-row">
              <span>{star} Stars</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              <span>{count}</span>
            </div>
          );
        })}
      </div>

      <h3>Recent Feedback</h3>
      {totalFeedbacks === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <ul className="feedback-list">
          {feedbacks.slice(-5).reverse().map((f, i) => (
            <li key={i}>
              <strong>{f.studentName}</strong> ({f.age}, {f.gender}) | {f.course} - {f.rating}/5
              <p>{f.comments}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}