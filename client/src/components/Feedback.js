import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_PROD || 'http://localhost:3001/api';


const RatingCategory = ({ title, rating, onRatingChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {title}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRatingChange(rating === value ? 0 : value)}
            className={`w-8 h-8 rounded-full ${
              rating === value
                ? 'bg-[#77dd77] text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

const Feedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState({
    design: 0,
    usability: 0,
    features: 0,
    performance: 0
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ratings,
          feedback
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send feedback');
      }

      // Reset form
      setRatings({
        design: 0,
        usability: 0,
        features: 0,
        performance: 0
      });
      setFeedback('');
      setIsOpen(false);

      // You might want to show a success message here
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert(`Failed to send feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
                   border-2 border-gray-800 shadow-[2px_2px_#77dd77] 
                   hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                   transition-all duration-200"
        aria-label="Give feedback"
      >
        <MessageSquare className="w-5 h-5 text-gray-800 dark:text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Feedback
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <RatingCategory 
                  title="Design & Visual Appeal"
                  rating={ratings.design}
                  onRatingChange={(value) => handleRatingChange('design', value)}
                />
                <RatingCategory 
                  title="Ease of Use"
                  rating={ratings.usability}
                  onRatingChange={(value) => handleRatingChange('usability', value)}
                />
                <RatingCategory 
                  title="Features & Functionality"
                  rating={ratings.features}
                  onRatingChange={(value) => handleRatingChange('features', value)}
                />
                <RatingCategory 
                  title="Performance & Reliability"
                  rating={ratings.performance}
                  onRatingChange={(value) => handleRatingChange('performance', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  className="w-full h-32 p-2 border-2 border-gray-800 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-white"
                  placeholder="Share your suggestions or report issues..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 
                           border-2 border-gray-800 shadow-[2px_2px_#ff6b6b] 
                           hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                           transition-all duration-200 text-gray-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback}
                  className="px-4 py-2 bg-white dark:bg-gray-800 
                           border-2 border-gray-800 shadow-[2px_2px_#77dd77] 
                           hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                           transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed text-gray-800 dark:text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Feedback;
