import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export const reviews = [
  {
    name: "Ashvin",
    role: "Developer",
    content: "Great work, I'm in love with the UI 💫",
    rating: 5,
    position: { left: '8%', top: '25%' },
    scale: 0.95,
    delay: 0
  },
  {
    name: "Sarah K.",
    role: "Student",
    content: "Thank you for this. I have ADHD and normal task managers don't work for me, but turning it into a game is def a great motivating factor for me!",
    rating: 5,
    position: { right: '12%', top: '35%' },
    scale: 1,
    delay: 1
  },
  {
    name: "Liam",
    role: "Project Lead",
    content: "This is exactly what I needed! I'm building an intranet for a new business, and this tool perfectly fits my needs. The timing couldn’t have been better!",
    rating: 5,
    position: { left: '15%', top: '60%' },
    scale: 0.9,
    delay: 2
  },
  {
    name: "Luteyla",
    role: "Student",
    content: "Much needed app! Love the gamification aspect",
    rating: 5,
    position: { right: '8%', top: '70%' },
    scale: 0.85,
    delay: 1.5
  }
];

const ReviewCards = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getPosition = (index) => {
    if (windowWidth <= 640) { // Mobile
      switch(index) {
        case 0: return { left: '5%', top: '15%' };
        case 1: return { right: '5%', top: '45%' };
        default: return null; 
      }
    } else if (windowWidth <= 1024) { // Tablet
      switch(index) {
        case 0: return { left: '5%', top: '20%' };
        case 1: return { right: '5%', top: '30%' };
        case 2: return { left: '8%', top: '55%' };
        default: return null;
      }
    } else { // Desktop
      return [
        { left: '8%', top: '25%' },
        { right: '12%', top: '35%' },
        { left: '15%', top: '60%' },
        { right: '8%', top: '70%' }
      ][index];
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {reviews.map((review, index) => {
        const position = getPosition(index);
        if (!position) return null; 

        return (
          <div
            key={index}
            className="fixed transition-all duration-500"
            style={{
              ...position,
              width: windowWidth <= 640 ? '200px' : '256px', 
              opacity: Math.max(0, 0.6 - (scrollY * 0.001)),
              transform: `scale(${windowWidth <= 640 ? review.scale * 0.8 : review.scale})`,
            }}
          >
            <div 
              className={`bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm 
                         rounded-lg p-4 shadow-lg animate-float
                         hover:opacity-80 transition-opacity duration-300`}
              style={{
                animationDelay: `${review.delay}s`,
                animationDuration: '8s'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {review.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {review.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {review.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-3 h-3 fill-current text-yellow-400" 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewCards;
