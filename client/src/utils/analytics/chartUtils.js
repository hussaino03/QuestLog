/**
 * Calculates responsive font sizes based on window width
 * Used to ensure chart text remains readable on different screen sizes
 * @param {number} windowWidth - Current window width in pixels
 * @returns {Object} Object containing small and regular font sizes
 */
export const getChartFontSizes = (windowWidth) => ({
  small: windowWidth < 640 ? 10 : 12,
  regular: windowWidth < 640 ? 12 : 14
});

/**
 * Common configuration for chart scales
 */
const commonScaleConfig = {
  grid: { display: false },
  ticks: {
    color: '#6B7280' 
  }
};

/**
 * Common configuration for chart plugins
 * Handles legend display and tooltip styling
 */
const commonPluginConfig = {
  legend: { display: false },
  tooltip: {
    backgroundColor: '#1F2937', 
    titleColor: '#F3F4F6',     
    bodyColor: '#F3F4F6',     
    displayColors: false
  }
};

/**
 * Creates chart options for both XP and Tasks charts
 * Handles responsive behavior and date range specific configurations
 * @param {number} dateRange - Number of days to display (7 or 30)
 * @param {Object} colors - Chart color configuration
 * @param {Object} fontSizes - Font size configuration
 * @returns {Object} Combined chart options for XP and Tasks charts
 */
export const createChartOptions = (startDate, endDate, colors, fontSizes) => {
  // Calculate days between dates for rotation logic
  const days = startDate && endDate ? 
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 7;
  
  return {
    xpChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...commonPluginConfig,
        tooltip: {
          ...commonPluginConfig.tooltip,
          callbacks: {
            label: (context) => `${context.parsed.y} XP`
          }
        }
      },
      scales: {
        y: {
          ...commonScaleConfig,
          beginAtZero: true,
          ticks: {
            ...commonScaleConfig.ticks,
            font: { size: fontSizes.small }
          }
        },
        x: {
          ...commonScaleConfig,
          ticks: {
            ...commonScaleConfig.ticks,
            maxRotation: days > 14 ? 65 : 45,
            minRotation: days > 14 ? 65 : 45,
            callback: function(val, index) {
              return days > 14 && index % 2 !== 0 ? '' : this.getLabelForValue(val);
            },
            font: { size: fontSizes.small }
          }
        }
      }
    },
    tasksChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...commonPluginConfig,
        tooltip: {
          ...commonPluginConfig.tooltip,
          callbacks: {
            label: (context) => `${context.parsed.y} tasks completed`
          }
        }
      },
      scales: {
        y: {
          ...commonScaleConfig,
          beginAtZero: true,
          ticks: {
            ...commonScaleConfig.ticks,
            stepSize: 1,
            font: { size: fontSizes.small }
          }
        },
        x: {
          ...commonScaleConfig,
          ticks: {
            ...commonScaleConfig.ticks,
            maxRotation: 45,
            minRotation: 45,
            font: { size: fontSizes.small }
          }
        }
      }
    }
  };
};

/**
 * Creates an empty chart data structure with basic styling
 * Used as initial state and for error/loading states
 * @param {Object} colors - Chart color configuration
 * @returns {Object} Empty chart data structure with styling
 */
export const createEmptyChartData = (colors) => ({
  labels: [],
  datasets: [{
    label: 'XP Gained',
    data: [],
    fill: false,
    borderColor: colors.primary,
    tension: 0.3,
    pointBackgroundColor: colors.primary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: 5
  }]
});
