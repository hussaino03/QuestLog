import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RangeToggle = ({ startDate, endDate, onRangeChange }) => {
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    onRangeChange(start, end);
  };

  return (
    <div className="relative">
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        maxDate={new Date()}
        placeholderText="Select Custom Range"
        className="w-full px-3 py-2 text-sm rounded-lg transition-colors
                  bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  hover:border-gray-300 dark:hover:border-gray-600
                  pr-8"
        dateFormat="MMM d, yyyy"
        isClearable={true}
      />
      <style jsx global>{`
        .react-datepicker__close-icon {
          right: 8px;
        }
        .react-datepicker__close-icon::after {
          background-color: transparent;
          color: #9ca3af;
          font-size: 18px;
        }
        .dark .react-datepicker__close-icon::after {
          color: #6b7280;
        }
        .react-datepicker__close-icon:hover::after {
          color: #4b5563;
        }
        .dark .react-datepicker__close-icon:hover::after {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default React.memo(RangeToggle);
