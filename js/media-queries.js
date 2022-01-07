const mediaQueries = (() => {

  const topMenu = () => {
    const mediaQuery = window.matchMedia('(max-width: 991px)');
    const topMenu = document.getElementById('top-menu');
    const items = topMenu.querySelectorAll('a.item');
    const header = topMenu.querySelector('div.header.item');
    const div = document.createElement('div');
  
    executeQuery(mediaQuery.matches);
    mediaQuery.onchange = (event) => executeQuery(event.matches);
    function executeQuery(matches) {
      if (matches) {
        header.before(div)
        items.forEach((item) => div.appendChild(item));
      } else {
        items.forEach((item) => header.after(item));
        div.remove();
      }
    }
  }

  return {
    topMenu
  }

})();
