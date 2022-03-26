import { loadMenu } from './components/menu.js';
import { state } from './state/state.js';
import { sheets } from './components/google-functions.js';
import { loadHome } from './components/home.js'
// import { topMenu }

window.baseUrl = window.location.href;
window.regNumbers = /[0-9]+/g;
window.regBeforeHyphen = /[^\-]*/;
window.regAfterHyphen = /[a-zA-Zà-úÀ-Ú0-9º \.]+$/g;
window.alphabetUp = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
window.isLoading = isLoading;
window.errorMessage = errorMessage;

const app = async () => {
  window.rootContent = document.getElementById('root-content');
  window.sheets = sheets();
  await loadMenu();
  loadGoogleApi();
  initState();
  setListener();
 };

document.addEventListener("DOMContentLoaded", app);

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

const initClient = () => {
  const API_KEY = 'AIzaSyCFZjHEVeI9QgwCARRcEzW5pdJ_GGyvCGQ';
  const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';
  const CLIENT_ID = '1074659725945-evslt5efu5blhquu7404fr95op7jv7ua.apps.googleusercontent.com';

  return gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function (error) {
    errorMessage(JSON.stringify(error, null, 2));
  });
}

const updateSignInStatus = async (isSigned) => {
  toggleBtnSignInOrOut(isSigned);
  window.isSignedIn = isSigned;
  console.log(isSigned);
  if (isSigned) {
    await loadHome();
    error.innerHTML = '';
    root.classList.remove('display-none');
    error.classList.add('display-none');
    gapi.client.load('drive', 'v3')
      .then(() => {
        //execute();
      });
  } else {
    //root.classList.add('display-none');
    errorMessage('Você não está autenticado! Favor clicar no botão "Sign In" no menu superior.\n'
      + 'Importante desabilitar o bloqueador de popup.');
  }
}

const toggleBtnSignInOrOut = (isSignedIn) => {
  if (isSignedIn) {
    menuBtnSignIn.classList.add('display-none');
    menuBtnSignOut.classList.remove('display-none');
  } else {
    menuBtnSignIn.classList.remove('display-none');
    menuBtnSignOut.classList.add('display-none');
  }
}

const handleSignInClick = (event) => {
  gapi.auth2.getAuthInstance().signIn();
}

const handleSignOutClick = (event) => {
  gapi.auth2.getAuthInstance().signOut();
  document.location.reload();
}

const setListener = () => {
  menuBtnSignIn.onclick = handleSignInClick;
  menuBtnSignOut.onclick = handleSignOutClick;
}

const loadGoogleApi = () => {
  gapi.load('client:auth2', initClient);
}
