import { Router } from "./router.js";

const app = async () => {
  const router = new Router({

    404: '/pages/404.html',
    '/': '/home.html',
    '/listar-dados': '/pages/list.html',
    '/modo-de-usar': '/pages/how-to-use.html',

  });

 window.onpopstate = router.handleLocation;

};

document.addEventListener("DOMContentLoaded", app);
