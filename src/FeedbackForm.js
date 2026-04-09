import React, { useState } from 'react';

export default function FeedbackForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    studentName: '',
    age: '',
    gender: '',
    course: '',
    rating: '',
    comments: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.age || !formData.gender || !formData.course || !formData.rating) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    onSubmit(formData);
    setFormData({ studentName: '', age: '', gender: '', course: '', rating: '', comments: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h2>Course Feedback</h2>
      {error && <p className="error">{error}</p>}

      <fieldset>
        <legend>Student Information</legend>
        <div className="form-group">
          <label htmlFor="studentName">Name:</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">--Select Gender--</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Course Details</legend>
        <div className="form-group">
          <label htmlFor="course">Select Course:</label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
          >
            <option value="">--Choose a Course--</option>
            <option value="web-dev">Full-Stack Web Development</option>
            <option value="data-structures">Data Structures & Algorithms</option>
            <option value="machine-learning">Machine Learning</option>
            <option value="devops">DevOps & CI/CD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="rating">Overall Rating (1-5):</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comments">Additional Comments:</label>
          <textarea
            id="comments"
            name="comments"
            rows="4"
            value={formData.comments}
            onChange={handleChange}
          ></textarea>
        </div>
      </fieldset>
      
      <button type="submit">Submit Feedback</button>
    </form>
  );
}