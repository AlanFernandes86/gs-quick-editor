import { loadMenu } from './components/menu.js';
import { googleApi } from './components/google-functions.js';
import { state } from './components/state.js';

window.baseUrl = window.location.href;
window.regNumbers = /[0-9]+/g;
window.regBeforeHyphen = /[^\-]*/;
window.regAfterHyphen = /[a-zA-Zà-úÀ-Ú0-9º \.]+$/g;
window.alphabetUp = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
window.isLoading = isLoading;
window.errorMessage = errorMessage;

const app = async () => {
  window.rootContent = document.getElementById('root-content');
  
  initState();
  await loadMenu();
  await initGoogle();
};

async function initGoogle() {
  window.google = await googleApi();
  google.loadGoogleApi();
}

function initState() {
  window.state = state();
  window.state.init();
}

function isLoading(enabled) {
  const loading = document.getElementById('loading');
  enabled ? loading.classList.remove('display-none') : loading.classList.add('display-none');
}

function errorMessage(message) {
  error.classList.remove('display-none');
  error.innerHTML = '';
  error.textContent = message;
}

document.addEventListener("DOMContentLoaded", app);