class ThemeManager {
  constructor(setIsDark) {
    this.setIsDark = setIsDark;
  }

  initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  };

  toggleTheme = (isDark) => {
    this.setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
}

export default ThemeManager;
