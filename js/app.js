import { loadMenu } from './components/menu.js';
import { googleApi } from './components/google-functions.js';

const baseUrl = window.location.href;

const app = async () => {
  console.log('ahaahha');
  await loadMenu(baseUrl);
  const google = await googleApi();
  google.loadGoogleApi();

  window.google = google;
  window.rootContent = document.getElementById('root-content');
};

document.addEventListener("DOMContentLoaded", app);