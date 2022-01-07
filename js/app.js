import { loadMenu } from './menu.js';
import { googleApi } from './google-functions.js';

const baseUrl = window.location.href;

const app = async () => {
  await loadMenu(baseUrl);
  const google = await googleApi();
  google.loadGoogleApi();
  window.google = google;
  
};

document.addEventListener("DOMContentLoaded", app);