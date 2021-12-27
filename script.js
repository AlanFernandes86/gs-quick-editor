const menuContainer = document.querySelector('.ui.menu.container');
const root = document.getElementById('root');
const home = document.getElementById('home');
const listData = document.getElementById('list-data');
const formData = document.getElementById('form-data');
const template = document.getElementById('template');
const howToUse = document.getElementById('how-to-use');
const pre = document.getElementById('error');

const menuBtnCancel = document.getElementById('menu-btn-cancel');
const menuBtnSave = document.getElementById('menu-btn-save');
const menuBtnSignIn = document.getElementById('menu-btn-sign-in');
const menuBtnSignOut = document.getElementById('menu-btn-sign-out');

const regNumbers = /[0-9]+/g;
const regBeforeHyphen = /[^\-]*/;
const regAfterHyphen = /[a-zA-Zà-úÀ-Ú0-9º \.]+$/g;

let spreadsheet = {};
let objects = [];
let tempObject = {};

menuBtnCancel.onclick = toggleFormOrList;
menuBtnSave.onclick = saveData;
menuBtnSignIn.onclick = handleSignInClick;
menuBtnSignOut.onclick = handleSignOutClick;
menuContainer.onclick = toggleMenuItem;

window.onload = () => {
  handleClientLoad();
}

/* // NÃO SEI EXATAMENTE O QUE FAZ, NÃO USAR POR ENQUANTO.
 window.onreadystatechange = () => {
  if (this.readyState === 'complete') this.onload();
} */

function loadHome() {
  $('#home').load('home.html', () => {

    let isExistingSheet = false;
    let columnTitleList = [];
    let columnTitleIndex = 0;
  
    const inputNewSheetTitle = document.getElementById('new-sheet-title');
    inputNewSheetTitle.oninput = (event) => spreadsheet.title = event.target.value;
    
    const inputNewColumnTitle = document.getElementById('new-column-title');
    inputNewColumnTitle.onkeyup = (event) => {
      if (event.key === 'Enter') {
        insertColumnTitle();
      }
    }

    const columnList = document.getElementById('column-list');
    
    class HomeStep {
      constructor(element, bottomStep, ...actions) {
        this.element = element;
        this.bottomStep = bottomStep;
        this.actions = actions;
      }
    }
    const homeSteps = [
      new HomeStep(document.getElementById('segment-0'), 0, newSheet, existingSheet),
      new HomeStep(document.getElementById('segment-1'), 1, createSheet, insertColumnTitle, saveColumnsTitles),
      new HomeStep(document.getElementById('segment-2'), 1, connectSheet),
      new HomeStep(document.getElementById('segment-3'), 2, setMainColumn, testSheetConnection),
      new HomeStep(document.getElementById('segment-4'), 3),
    ];

    const navigation = {
      startToCreateSheet : [ 0, 1 ], 
      startToExistingSheet : [0, 2],
      createSheetToMainColumn : [ 1, 3 ],
      existingSheetToMainColumn : [ 2, 3 ],
      mainColumnToFinished : [ 3, 4 ],
    }

    homeSteps.forEach((step, index) => {
      setActions(index);
    })

    document.querySelectorAll('.step').forEach((step) => {
      step.onclick = bottomStepsToggle;
    })
    
    function bottomStepsToggle(event) {
      const segments = document.querySelectorAll('.ui.attached.segment');
      const from = +Array(...segments)
                    .find((segment) => !segment.classList.contains('display-none'))
                    .id.match(regAfterHyphen)[0];
      let to = +event.currentTarget.id.match(regAfterHyphen)[0];

      if (to === 1 && isExistingSheet) { 
        to = 2 
      } else if (to > 1) {
        to += 1;
      }

      toggleSteps(from, to);
    }

    function setActions(step) {
      const homeStep = homeSteps[step];
      homeStep.actions.forEach((action, index) => {
        document.getElementById(`btn-${step}-${index}`).onclick = action;
      }); 
    }

    function toggleSteps(from, to) {
      homeSteps[from].element.classList.add('display-none');
      homeSteps[to].element.classList.remove('display-none');
      from = homeSteps[from].bottomStep;
      to = homeSteps[to].bottomStep;
      setActiveBottomStep(from, to);
      if (from > to) {
        while (from > to) {
          setDisabledBottomStep(from, false);
          from -= 1;
        }
      } else {
        setDisabledBottomStep(to, true);
      }      
    }

    function setDisabledBottomStep(position, enabled) {
      const bottomStep = document.getElementById(`step-${position}`);
      enabled 
      ? bottomStep.classList.remove('disabled')
      : bottomStep.classList.add('disabled');
    }

    function setActiveBottomStep(from, to) {
      document.getElementById(`step-${from}`).classList.remove('active');
      document.getElementById(`step-${to}`).classList.add('active');
    }

    function newSheet() {
      toggleSteps(...navigation.startToCreateSheet);
      isExistingSheet = false;
    }

    function existingSheet() {
      toggleSteps(...navigation.startToExistingSheet);
      isExistingSheet = true;
    }

    function createSheet() {
      const btn0 = document.getElementById('btn-1-0');
       
      btn0.classList.add('loading');
      if (spreadsheet.title !== '' && spreadsheet.title) {
        requestCreateSheet(spreadsheet.title).then((result) => {
          spreadsheet.spreadsheetId = result.spreadsheetId;
          insertLeftCornerLabel(inputNewSheetTitle, 'check', 'green', 'disabled')
          btn0.classList.add('disabled');
          btn0.classList.remove('loading');
          document.getElementById('add-column-title').classList.remove('display-none');
        });
      } else {
        insertLeftCornerLabel(inputNewSheetTitle, 'close', 'red', 'enabled');
        btn0.classList.remove('loading');
      }
    }

    function insertLeftCornerLabel(input, icon, color, status) {
      const div = document.createElement('div');
      div.classList.add('ui', 'left', 'corner', 'label');
      const i = document.createElement('i');
      i.classList.add(icon, 'icon', color);
      div.appendChild(i);
      input.parentElement.classList.add('left', 'corner', 'labeled', status);
      input.parentElement.appendChild(div);
    }

    async function requestCreateSheet(title) {
      const spreadsheetBody = {
        "properties": {
          "title": title,
        },
      };
      return new Promise((resolve) => {
        const request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
        request.then(function(response) {
          resolve(response.result);
        }, function(reason) {
          console.error('error: ' + reason.result.error.message);
        });
      });
    }

    function insertColumnTitle() {
      const item = document.createElement('div');
      item.classList.add('item');

      const rightFloatedContent = document.createElement('div');
      rightFloatedContent.classList.add('right', 'floated', 'content');
      item.appendChild(rightFloatedContent);

      const i = document.createElement('i');
      i.classList.add('icon', 'close', 'red', 'large');
      rightFloatedContent.appendChild(i);

      const content = document.createElement('div');
      content.classList.add('content');
      item.appendChild(content);

      const header = document.createElement('div');
      header.classList.add('header');
      header.textContent = inputNewColumnTitle.value;
      content.appendChild(header);
      
      columnTitleList.push({title: inputNewColumnTitle.value, index: columnTitleIndex});
      item.id = `column-title-${columnTitleIndex}`;
      i.id = `delete-${columnTitleIndex}`;
      columnTitleIndex += 1;

      inputNewColumnTitle.value = '';
      inputNewColumnTitle.focus();

      columnList.appendChild(item);
      
      i.onclick = deleteColumnTitle;

      btnOneTwo();
    }

    function saveColumnsTitles() {
        toggleSteps(...navigation.createSheetToMainColumn);   
    }

    function deleteColumnTitle(event) {
      const id = +event.target.id.match(regAfterHyphen)[0];
      const elementId = `column-title-${id}`;

      columnTitleList.forEach((title, index) => {
        if (title.index === id) {
          columnTitleList.splice(index, 1);
        }
      });
      
      const element = document.getElementById(elementId);
      element.remove();

      btnOneTwo();
    }

    function btnOneTwo() {
      const btn2 = document.getElementById('btn-1-2');
      columnTitleList.length > 0 
      ? btn2.classList.remove('display-none') 
      : btn2.classList.add('display-none');
    }

    function connectSheet() {
      toggleSteps(...navigation.existingSheetToMainColumn);
    }

    function setMainColumn() {
      
    }

    function testSheetConnection() {
      toggleSteps(...navigation.mainColumnToFinished);
    }


  });
}

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
  switch (id) {
    case 'menu-item-home':
      toggleRootChildrenDisplay(home.id);
      break;
    case 'menu-item-list-data':
      toggleRootChildrenDisplay(listData.id);
      listAll();
      break;
    case 'menu-item-template':
      toggleRootChildrenDisplay(template.id);
      break;
    case 'menu-item-how-to-use':
      toggleRootChildrenDisplay(howToUse.id);
      break;
  }
}

function toggleRootChildrenDisplay(id) {
  const rootDiv = root.children;
  new Array(...rootDiv).every((element) => {
    if (element.id === id && !element.classList.contains('display-none')) return false;
    element.id === id ? element.classList.remove('display-none') : element.classList.add('display-none');
    return true;
  });
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
    root.classList.remove('display-none');
  } else {
    root.classList.add('display-none');
    appendPre('Você não está autenticado! Favor clicar no botão "Sign In" no menu superior.\n'
      + 'Importante desabilitar o bloqueador de popup.');
  }
}

function toggleBtnSignInOrOut(isSignedIn) {
  if (isSignedIn) {
    menuBtnSignIn.classList.add('display-none');
    menuBtnSignOut.classList.remove('display-none');
    loadHome();
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
  isLoading(true);
  getAll()
    .then((response) => {
      objects = response;
      listNames(response);
      isLoading(false);
    })
    .catch((error) => {
      error.message;
      isLoading(false);
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

function arrayToObject(rows) {
  const rowsObject = [];

  rows.forEach((row, index, array) => {
    if (index === 0) return;
    const object = {}
    row.forEach((value, i) => {
      object[array[0][i]] = value;
    })
    rowsObject.push(object)
  });
  return rowsObject;
}

function listNames(rowsObject) {
  const list = document.getElementById('list-data');
  list.innerHTML = ''
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
  menuBtnSignOut.classList.toggle('display-none');

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

async function putObject() {
  return new Promise((resolve, reject) => {
    const params = {
      spreadsheetId: '1I9RpIdtTyOvFZ5WPU4KYqzux4XmPotF2lkfLpQY-tnE',
      range: 'A11',
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

async function saveData(event) {
  const response = await putObject();
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

function isLoading(enabled) {
  const loading = document.getElementById('loading');
  enabled ? loading.classList.remove('display-none') : loading.classList.add('display-none');
}



