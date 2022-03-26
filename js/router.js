import { loadHome } from "./components/home.js";
import { loadList } from "./components/list.js";

const root = document.getElementById('root');

export const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  console.log(window.location.hash);
  handleLocation();
};

const routes = {
  404: () => {},
  '': loadHome,
  '#listar-dados': loadList,
  '#template': () => {},
  '#modo-de-usar': () => {},
};

export const handleLocation = () => {
  const path = window.location.hash;
  console.log(path);
  const route = routes[path] || routes[404];
  route.call();
};


window.onpopstate = handleLocation;
