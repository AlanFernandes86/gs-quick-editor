import { loadHome } from './home.js';
import { loadList } from './list.js';

export const loadMenu = async (url) => {

  return fetch(`${url}pages/menu.html`)
    .then((data) => data.text())
    .then((text) => {
      
      document.getElementById('menu').innerHTML = text;

      const menuContainer = document.querySelector('.ui.menu.container');

      menuContainer.onclick = toggleMenuItem;

      function toggleMenuItem(event) {
        const id = event.target.id;
        activeMenuItem(id);
        updateRoot(id);
      }

      function activeMenuItem(id) {
        const menuItems = document.querySelectorAll('a.item');
        new Array(...menuItems).every((element) => {
          if (element.id === id && element.classList.contains('active')) return false;
          element.id === id ? element.classList.add('active') : element.classList.remove('active');
          return true;
        });
      }

      function updateRoot(id) {
        const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        if (isSignedIn) {
          switch (id) {
            case 'menu-item-home':
              loadHome(url);
              break;
            case 'menu-item-list-data':
              loadList(url);
              break;
            case 'menu-item-template':
              
              break;
            case 'menu-item-how-to-use':
              loadHowToUse();
              break;
          }
        }
      }     
      // mediaQueries.topMenu();
    });

}