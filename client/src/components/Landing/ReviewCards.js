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
    name: "Sarah",
    role: "Student",
    content: "I have ADHD, and normal task managers don't work for me, but gamifying them definitely helps!",
    rating: 5,
    position: { right: '12%', top: '35%' },
    scale: 1,
    delay: 1
  },
  {
    name: "Liam",
    role: "Project Lead",
    content: "This is exactly what I needed! This tool perfectly fits my needs.",
    rating: 5,
    position: { left: '15%', top: '60%' },
    scale: 0.9,
    delay: 2
  },
  {
    name: "Luteyla",
    role: "Student",
    content: "Much needed app! Love the gamification aspect 🎮",
    rating: 5,
    position: { right: '8%', top: '70%' },
    scale: 0.85,
    delay: 1.5
  },
  {
    name: "Anwar M.",
    role: "Developer",
    content: "Great app! I like the UI and the gamification aspect, definitely adding this to my current workflow",
    rating: 5,
    scale: 0.9,
    delay: 2.5
  },
  {
    name: "Usman",
    role: "Student",
    content: "The project collaboration feature is a nice addition!",
    rating: 4,
    scale: 0.95,
    delay: 1.8
  },
  {
    name: "David",
    role: "Designer",
    content: "Clean interface, smart features. Makes task & project management actually fun!",
    rating: 4,
    scale: 0.88,
    delay: 0.5
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
    // Only return desktop positions since mobile uses dedicated section
    return [
      { left: '8%', top: '25%' },
      { right: '10%', top: '20%' },
      { left: '15%', top: '50%' },
      { right: '6%', top: '65%' },
      { left: '5%', top: '80%' },
      { right: '12%', top: '40%' },
      { left: '20%', top: '35%' }
    ][index];
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden sm:block">
      {reviews.map((review, index) => {
        const position = getPosition(index);
        if (!position) return null; 

        const baseOpacity = 0.55;
        const scrollFactor = Math.max(0, 1 - (scrollY * 0.0015));
        const finalOpacity = baseOpacity * scrollFactor;

        return (
          <div
            key={index}
            className="fixed transition-all duration-700"
            style={{
              ...position,
              width: windowWidth <= 640 ? '180px' : '220px',
              transform: `scale(${windowWidth <= 640 ? review.scale * 0.7 : review.scale * 0.85})`,
            }}
          >
            <div 
              className="opacity-0 animate-fadeIn"
              style={{
                animationDelay: `${0.5 + index * 0.1}s`,
                animationDuration: '0.6s',
                animationFillMode: 'forwards'
              }}
            >
              <div 
                className="animate-float"
                style={{
                  opacity: finalOpacity,
                  transition: 'opacity 0.3s ease-out',
                  animationDelay: `${1 + index * 0.2}s`, // Start floating after fade-in
                }}
              >
                <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3 shadow-sm transition-all duration-300 hover:opacity-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {review.name}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-300">
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-2.5 h-2.5 fill-current text-yellow-500" 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-3 font-medium">
                    {review.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewCards;
