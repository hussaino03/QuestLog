import React, { useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

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
                ? 'bg-[#2563EB] text-white'
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

const Feedback = ({ userId }) => {
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
    setRatings((prev) => ({
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
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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

      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert(`Failed to send feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <button
        onClick={() => alert('Please log in to provide feedback')}
        className="inline-flex items-center gap-1 cursor-not-allowed opacity-60"
        title="Please log in to provide feedback"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Feedback</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
        aria-label="Give feedback"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-modalSlide">
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedback
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Help us improve QuestLog with your feedback
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <span className="text-red-600 dark:text-red-400 text-lg">
                  ×
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4 text-left">
                <RatingCategory
                  title="Design & Visual Appeal"
                  rating={ratings.design}
                  onRatingChange={(value) =>
                    handleRatingChange('design', value)
                  }
                />
                <RatingCategory
                  title="Ease of Use"
                  rating={ratings.usability}
                  onRatingChange={(value) =>
                    handleRatingChange('usability', value)
                  }
                />
                <RatingCategory
                  title="Features & Functionality"
                  rating={ratings.features}
                  onRatingChange={(value) =>
                    handleRatingChange('features', value)
                  }
                />
                <RatingCategory
                  title="Performance & Reliability"
                  rating={ratings.performance}
                  onRatingChange={(value) =>
                    handleRatingChange('performance', value)
                  }
                />
              </div>

              <div className="text-left">
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

              {isSubmitting && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    Sending feedback...
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex items-start gap-2 text-left">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your feedback will be sent from your registered email
                    address
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !feedback}
                    className="px-4 py-2 bg-white dark:bg-gray-800 
                             border-2 border-gray-800 shadow-[2px_2px_#2563EB] 
                             hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 
                             transition-all duration-200 disabled:opacity-50 
                             disabled:cursor-not-allowed text-gray-800 dark:text-white"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Feedback;
