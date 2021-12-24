const topMenuButton = document.getElementById('top-menu-btn');
const placeholder = document.querySelector('.ui.placeholder');
const listData = document.getElementById('list-data');
const root = document.getElementById('root');
const pre = document.getElementById('error');
const menuBtnCancel = document.getElementById('menu-btn-cancel');
const menuBtnSave = document.getElementById('menu-btn-save');
const menuBtnSignIn = document.getElementById('menu-btn-sign-in');
const menuBtnSignOut = document.getElementById('menu-btn-sign-out');
const formData = document.getElementById('form-data');

const regNumbers = /[0-9]+/g;
const regBeforeHyphen = /[^\-]*/;
const regAfterHyphen = /[a-zA-Zà-úÀ-Ú0-9º \.]+$/g;
let objects = [];
let tempObject = {};

menuBtnCancel.onclick = toggleFormOrList;
menuBtnSave.onclick = saveData;
menuBtnSignIn.onclick = handleSignInClick;
menuBtnSignOut.onclick = handleSignOutClick;

window.onload = () => {
  handleClientLoad();
}

window.onreadystatechange = () => {
  if (this.readyState === 'complete') this.onload();
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function appendPre(message) {
  const textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  const API_KEY = 'AIzaSyCFZjHEVeI9QgwCARRcEzW5pdJ_GGyvCGQ';
  const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
  const CLIENT_ID = '1074659725945-evslt5efu5blhquu7404fr95op7jv7ua.apps.googleusercontent.com';
  
  placeholder.style.display = 'block';
  
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function (error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

function updateSignInStatus(isSignedIn) {
  toggleBtnSignInOrOut(isSignedIn);
  if (isSignedIn) {
    pre.innerHTML = '';
    listAll();
  } else {
    appendPre('Você não está autenticado! Favor clicar no botão "Sign In" no menu superior.\n'
    + 'Importante desabilitar o bloqueador de popup.');
    placeholder.display = 'none';
  }
}

function toggleBtnSignInOrOut(isSignedIn) {
  if(isSignedIn) {
    menuBtnSignIn.classList.add('display-none');
    menuBtnSignOut.classList.remove('display-none');
  } else {
    menuBtnSignIn.classList.remove('display-none');
    menuBtnSignOut.classList.add('display-none');
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  document.location.reload();
}


async function listAll() {
  getAll()
    .then((response) => {
      placeholder.style.display = 'none';
      objects = response;
      listNames(response);
    })
    .catch((error) => {
      error.message;
    })
}

async function getAll() {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1Qg0BM5YWpI9NpRJ82W_uKV0eG5ZAlJ61dO5jb-3pB-w',
      range: 'A1:AC',
    }).then(function (response) {
      const range = response.result;
      if (range.values.length > 0) {
        resolve(arrayToObject(range.values));
      } else {
        appendPre('No data found.');
      }
    }, function (response) {
      appendPre('Error: ' + response.result.error.message);
    });
  });
}

async function putObject() {
  return new Promise((resolve, reject) => {
    const params = {
      spreadsheetId: '1I9RpIdtTyOvFZ5WPU4KYqzux4XmPotF2lkfLpQY-tnE',  // TODO: Update placeholder value.
      range: 'A10:AD',
      valueInputOption: 'RAW', 
      includeValuesInResponse: true,
    }

    const valueRangeBody = {
      values: [
        Object.values(tempObject),
      ],
      majorDimension: 'ROWS',
    };
    gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody).then(function (response) {
      resolve(response);
    }, function (response) {
      appendPre('Error: ' + response.result.error.message);
    });
  });
}

function arrayToObject(rows) {
  const rowsObject = [];

  rows.forEach((row, index, array) => {
    if (index === 0) return;
    const object = {}
    row.forEach((value, i) => {
      object[array[0][i]] = value;
    })
    object.id = index;
    rowsObject.push(object)
  });
  return rowsObject;
}

function listNames(rowsObject) {
  const list = document.getElementById('list-data');
  rowsObject.forEach((value, index) => {
    const divItem = document.createElement('div');
    divItem.classList.add('item');
    list.appendChild(divItem);

    addBtnShow(divItem, index);
    addCheckbox(divItem, value, index);
  });

  $('.ui.checkbox').checkbox();
}

function addCheckbox(divItem, value, index) {
  const divCheckbox = document.createElement('div');
  divCheckbox.classList.add('content');
  divItem.appendChild(divCheckbox);

  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('ui', 'checkbox');
  divCheckbox.appendChild(checkboxContainer);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'nomes';
  checkbox.id = `chk-${index}`;
  checkboxContainer.appendChild(checkbox);

  const label = document.createElement('label');
  label.textContent = value['Nome'];
  label.classList.add('header');
  checkboxContainer.appendChild(label);
}

function addBtnShow(divItem, index) {
  const btnContainer = document.createElement('div');
  btnContainer.classList.add('right', 'floated', 'content');
  divItem.appendChild(btnContainer);

  const buttonShow = document.createElement('div');
  buttonShow.classList.add('ui', 'button');
  buttonShow.id = `btn-${index}`;
  buttonShow.textContent = "Mostrar dados";
  btnContainer.appendChild(buttonShow);

  buttonShow.onclick = showData;
}

function showData(event) {
  const id = event.target.id.match(regNumbers)[0];
  console.log(id);
  tempObject = Object.assign({}, objects[id]);
  Object.entries(tempObject).forEach((item) => {
    createInput(id, 'text', item);
  });
  placeholder.style.display = 'none';
  toggleFormOrList();
}

function createInput(objId, type, entries) {
  const field = document.createElement('div');
  field.className = 'field';
  const input = document.createElement('input');
  input.id = `${objId}-${entries[0]}`;
  input.type = type;
  input.value = entries[1];
  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.textContent = entries[0];

  input.oninput = updateValue;

  field.appendChild(label);
  field.appendChild(input);
  formData.appendChild(field);
}

function updateValue(event) {
  // const index = event.target.id.match(rBeforeHyphen)[0];
  const key = event.target.id.match(regAfterHyphen)[0];
  tempObject[key] = event.target.value;
}

function toggleFormOrList() {
  menuBtnCancel.classList.toggle('display-none');
  menuBtnSave.classList.toggle('display-none');

  if (listData.classList.contains('display-none')) {
    listData.classList.remove('display-none');
  } else {
    listData.classList.add('display-none');
  }
  if (formData.classList.contains('display-none')) {
    formData.classList.remove('display-none');
    enableFixedMenu();
  } else {
    formData.innerHTML = '';
    disableFixedMenu();
    formData.classList.add('display-none');
  }
}

async function saveData(event) {
  placeholder.style.display = 'block';
  const response = await putObject();
  placeholder.style.display = 'none';
  console.log(response.status);
}

function enableFixedMenu() {
  $('#root')
    .visibility({
      once: false,
      observeChanges: true,
      onTopPassed: function () {
        $('.overlay')
          .visibility({
            type: 'fixed',
            offset: 15 // give some space from top of screen
          });
      },
      onTopVisible: restoreMenu,
    });
}

function restoreMenu() {
  $('.overlay').removeClass('fixed');
  $('.overlay').removeAttr('style');
  $('.overlay.placeholder').css('display', 'none');
}

function disableFixedMenu() {
  restoreMenu();
  $('#root')
    .visibility({
      observeChanges: false,
    })
}


