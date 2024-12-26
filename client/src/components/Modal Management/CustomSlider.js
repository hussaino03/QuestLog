import React, { useState, useCallback, useEffect } from 'react';

const CustomSlider = ({
  value,
  onChange,
  min = 1,
  max = 100,
  snapPoints = [25, 50, 75],
  leftLabel,
  rightLabel,
  snapLabels = []
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const [isDragging, setIsDragging] = useState(false);

  const constrainValue = useCallback(
    (value) => {
      return Math.min(Math.max(value, min), max);
    },
    [min, max]
  );

  const getSnapValue = useCallback(
    (value) => {
      const snapThreshold = 5;
      let closestSnap = value;
      let minDistance = snapThreshold;

      snapPoints.forEach((point) => {
        const distance = Math.abs(value - point);
        if (distance < minDistance) {
          minDistance = distance;
          closestSnap = point;
        }
      });

      return minDistance < snapThreshold ? closestSnap : value;
    },
    [snapPoints]
  );

  const handleChange = useCallback(
    (newValue) => {
      const constrainedValue = constrainValue(newValue);
      const finalValue = isDragging
        ? constrainedValue
        : getSnapValue(constrainedValue);

      setLocalValue(finalValue);
      onChange(finalValue);
    },
    [isDragging, constrainValue, getSnapValue, onChange]
  );

  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newValue = Math.round(position * (max - min) + min);
    handleChange(newValue);
  };

  const handleSnapPointClick = (point, e) => {
    e.preventDefault();
    e.stopPropagation();
    handleChange(point);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Apply snap effect when releasing the slider
    handleChange(localValue);
  };

  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX >= 0 && clickX <= rect.width) {
      const percentage = clickX / rect.width;
      const newValue = Math.round(percentage * (max - min) + min);
      handleChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-8">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      <div className="relative h-6 mt-8">
        {/* Snap point labels */}
        <div className="absolute -top-8 w-full">
          {snapPoints.map((point, index) => (
            <div
              key={`label-${point}`}
              className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
              style={{
                left: `${((point - min) / (max - min)) * 100}%`
              }}
            >
              {snapLabels[index]}
            </div>
          ))}
        </div>

        <div className="relative" onClick={handleTrackClick}>
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer" />

          {/* Active track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-150 ease-out cursor-pointer"
            style={{ width: `${((localValue - min) / (max - min)) * 100}%` }}
          />

          {/* Snap points */}
          {snapPoints.map((point) => (
            <button
              key={point}
              onMouseDown={(e) => handleSnapPointClick(point, e)}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full 
                         transition-all duration-150 ease-out border-2 cursor-pointer
                         ${
                           localValue >= point
                             ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600'
                             : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                         } hover:border-blue-600 dark:hover:border-blue-500
                         ${Math.abs(localValue - point) < 5 ? 'scale-125' : ''}`}
              style={{
                left: `${((point - min) / (max - min)) * 100}%`,
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
              aria-label={`Set value to ${point}`}
            />
          ))}

          {/* Slider container with bounds checking */}
          <div
            className="absolute inset-0"
            onMouseMove={(e) => isDragging && handleSliderChange(e)}
          >
            <input
              type="range"
              min={min}
              max={max}
              value={localValue}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute top-1/2 -translate-y-1/2 w-full h-6 opacity-0 cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full 
                         border-2 border-blue-500 dark:border-blue-600 shadow-md
                         -translate-x-1/2 hover:scale-110 transition-all duration-150 ease-out
                         ${isDragging ? 'scale-110' : ''}`}
              style={{
                left: `${((localValue - min) / (max - min)) * 100}%`,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>

      <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
        {localValue}%
      </div>
    </div>
  );
};

export default CustomSlider;
