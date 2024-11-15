import React, { useEffect } from 'react';

const LevelUpModal = ({ show, onClose, level }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full transform transition-all animate-slideIn">
        <p className="text-2xl font-bold text-center text-gray-800">
          Level up! You are now level {level}!
        </p>
      </div>
    </div>
  );
};

export default LevelUpModal;