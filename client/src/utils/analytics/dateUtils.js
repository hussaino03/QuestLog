export const formatDate = (date, useWeekday = false) => {
  if (useWeekday) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
    });
  }
  
  const localDate = new Date(date.toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }));
  const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
  const day = localDate.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

export const transformChartDates = (data, useWeekday = false) => {
  if (!data?.labels || !data?.datasets) return null;
  
  return {
    ...data,
    labels: data.labels.map(label => {
      const [month, day] = label.split('/');
      const date = new Date(new Date().getFullYear(), Number(month) - 1, Number(day));
      return formatDate(date, useWeekday);
    })
  };
};
