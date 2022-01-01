const mediaQueries = (() => {

  const topMenu = () => {
    const mediaQuery = window.matchMedia('(max-width: 991px)');
    const topMenu = document.getElementById('top-menu');
  
    executeQuery(mediaQuery.matches);
    mediaQuery.onchange = (event) => executeQuery(event.matches);
    function executeQuery(matches) {
      if (matches) {
        topMenu.style.backgroundColor = 'magenta';
      } else {
        topMenu.style.backgroundColor = '';
      }
    }
  }

  return {
    topMenu
  }

})();

