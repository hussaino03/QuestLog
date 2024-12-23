export const getChartFontSizes = (windowWidth) => ({
  small: windowWidth < 640 ? 10 : 12,
  regular: windowWidth < 640 ? 12 : 14
});

export const createChartOptions = (dateRange, colors, fontSizes) => ({
  xpChartOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} XP`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
          font: { size: fontSizes.small }
        },
        grid: { display: false }
      },
      x: {
        ticks: {
          color: '#6B7280',
          maxRotation: dateRange === 30 ? 65 : 45,
          minRotation: dateRange === 30 ? 65 : 45,
          callback: function(val, index) {
            return dateRange === 30 && index % 2 !== 0 ? '' : this.getLabelForValue(val);
          },
          font: { size: fontSizes.small }
        },
        grid: { display: false }
      }
    }
  },
  tasksChartOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} tasks completed`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6B7280',
          font: { size: fontSizes.small }
        },
        grid: { display: false }
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: { size: fontSizes.small }
        },
        grid: { display: false }
      }
    }
  }
});

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
