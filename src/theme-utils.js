export function updateThemeVars() {
  let isDark = false;

  if (document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode')) {
    isDark = true;
  }
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark = true;
  }
  else {
    const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-background-color')
    ?.trim()
    ?.toLowerCase();
    
    if (bgColor && (bgColor.startsWith('#1') || bgColor.startsWith('rgb(0,') || bgColor.startsWith('rgb(17,') || bgColor.startsWith('rgb(30,'))) {
      isDark = true;
    }
  }
  
  const filter = isDark ? 'invert(100%)' : 'invert(0%)';
  const textColor = isDark ? 'white' : 'black';

  document.documentElement.style.setProperty('--icon-filter', filter);
  document.documentElement.style.setProperty('--coffee-text', textColor);
  document.documentElement.style.setProperty('--is-dark-mode', isDark ? '1' : '0');
}