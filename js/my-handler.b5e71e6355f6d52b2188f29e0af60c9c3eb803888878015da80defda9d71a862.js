/**
 * 自动隐藏 Netlify 的底栏
 */
(() => {
  try {
    window.localStorage.setItem('nl-hud:public:v1', 'hidden');
  } catch {
    // Ignore unavailable or blocked localStorage.
  }
})();
