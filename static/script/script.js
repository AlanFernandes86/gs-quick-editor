const root = document.getElementById('root');
const home = document.getElementById('home');
const list = document.getElementById('list');
const template = document.getElementById('template');
const howToUse = document.getElementById('how-to-use');
const error = document.getElementById('error');

const regNumbers = /[0-9]+/g;
const regBeforeHyphen = /[^\-]*/;
const regAfterHyphen = /[a-zA-Zà-úÀ-Ú0-9º \.]+$/g;
const alphabetUp = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

const baseUrl = window.location.href;

// https://developer.mozilla.org/pt-BR/docs/Glossary/IIFE
const state = (() => {
  let spreadsheets = [];
  let spreadsheet = {};
  let objects = [];
  let tempObject = {};

  return {
    getSpreadsheetsList: () => spreadsheets,
    getActiveSpreadsheet: () => {
      const temp = spreadsheets.find((spreadsheet) => spreadsheet.active) || {};
      spreadsheet = temp.spreadsheet || {};
      if (Object.keys(spreadsheet).length === 0) return false;
      return spreadsheet;
    },
    setSpreadsheetsList: (value) => {
      spreadsheets = value;
      return spreadsheets;
    },
    deactivateAllSpreadsheets: () => {
      spreadsheets.forEach((spreadsheet) => spreadsheet.active = false);
    },
    clearSpreadsheet: () => {
      spreadsheet = {};
    },
    setActiveSpreadsheet: (index) => {
      spreadsheets.forEach((spreadsheet, i) => {
        if (index === i) {
          spreadsheet.active = true;
          spreadsheets.splice(i, 1);
          spreadsheets.splice(0, 0, spreadsheet);
        } else {
          spreadsheet.active = false;
        }
      });
    },
    getSpreadsheet: () => spreadsheet,
    setSpreadsheet: (value) => {
      spreadsheet = value;
      return spreadsheet;
    },
    addSpreadsheetInSpreadsheetList: () => {
      if (spreadsheets) {
        state.deactivateAllSpreadsheets();
      }
      spreadsheets.push({ spreadsheet, active: true });
    },
    removeSpreadsheetOfSpreadsheetList: (index) => {
      if (spreadsheets[index].active && spreadsheets.length > 1) {
        spreadsheets.splice(index, 1);
        spreadsheets[0].active = true;
      } else {
        spreadsheets.splice(index, 1);
      }
    },
    getSheetObjects: () => objects,
    setSheetObjects: (value) => {
      objects = value;
      return objects;
    },
    getTempObject: () => tempObject,
    setTempObject: (id) => {
      tempObject = Object.assign({}, objects[id]);
      return tempObject;
    },
    newTempObject: () => {
      const columns = spreadsheet.values[0];
      const temp = {};
      columns.forEach((title) => temp[title] = '');
      tempObject = temp;
      return tempObject;
    }
    ,
    updateTempObject: (key, value) => {
      tempObject[key] = value;
      return tempObject;
    }
  }
})();

window.onload = () => {
  if (localStorage.getItem('spreadsheets')) {
    state.setSpreadsheetsList(JSON.parse(localStorage.getItem('spreadsheets')));
  }
  loadMenu();
  loadGoogleApi();
}

function errorMessage(message) {
  error.classList.remove('display-none');
  error.innerHTML = '';
  error.textContent = message;
}

/* // NÃO SEI EXATAMENTE O QUE FAZ, NÃO USAR POR ENQUANTO.
 window.onreadystatechange = () => {
  if (this.readyState === 'complete') this.onload();
} */

let menuBtnSignIn = undefined;
let menuBtnSignOut = undefined;
function loadMenu() {
  $('#menu').load(`${baseUrl}menu.html`, () => {

    const menuContainer = document.querySelector('.ui.menu.container');
    const mMenuBtnSignIn = document.getElementById('menu-btn-sign-in');
    const mMenuBtnSignOut = document.getElementById('menu-btn-sign-out');

    menuBtnSignIn = mMenuBtnSignIn;
    menuBtnSignOut = mMenuBtnSignOut;

    mMenuBtnSignIn.onclick = handleSignInClick;
    mMenuBtnSignOut.onclick = handleSignOutClick;
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
            toggleRootChildrenDisplay(home.id);
            loadHome();
            break;
          case 'menu-item-list-data':
            toggleRootChildrenDisplay(list.id);
            loadList();
            break;
          case 'menu-item-template':
            toggleRootChildrenDisplay(template.id);
            break;
          case 'menu-item-how-to-use':
            toggleRootChildrenDisplay(howToUse.id);
            loadHowToUse();
            break;
        }
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
    mediaQueries.topMenu();
  });
}

function loadHome() {
  $('#home').load(`${baseUrl}home.html`, () => {

    let isExistingSheet = false;
    let columnList = [];
    let columnIndex = 0;

    const inputNewSheetTitle = document.getElementById('new-sheet-title');
    inputNewSheetTitle.oninput = (event) => state.getSpreadsheet().title = event.target.value;

    const inputNewColumnTitle = document.getElementById('new-column-title');
    inputNewColumnTitle.onkeyup = (event) => {
      if (event.key === 'Enter') {
        insertColumnTitle();
      }
    }

    const checkIcon = document.getElementById('check-icon');
    const columnListHtml = document.getElementById('column-list');
    const btn1Two = document.getElementById('btn-1-2');
    const selectColumns = document.getElementById('select-columns');
    const warningContainer = document.getElementById('warning-container');
    const warningMessage = document.getElementById('warning-message');

    class HomeStep {
      constructor(element, bottomStep, ...actions) {
        this.element = element;
        this.bottomStep = bottomStep;
        this.actions = actions;
      }
    }
    const homeSteps = [
      new HomeStep(document.getElementById('segment-0'), 0, newSheet, existingSheet),
      new HomeStep(document.getElementById('segment-1'), 1, setSheetTitle, insertColumnTitle, saveColumnsAndGo),
      new HomeStep(document.getElementById('segment-2'), 1, selectExistingSheet),
      new HomeStep(document.getElementById('segment-3'), 2, setMainColumn, createSpreadsheet, addSpreadsheet),
      new HomeStep(document.getElementById('segment-4'), 3),
    ];

    const navigation = {
      startToCreateSheet: [0, 1],
      startToExistingSheet: [0, 2],
      createSheetToMainColumn: [1, 3],
      existingSheetToMainColumn: [2, 3],
      mainColumnToFinished: [3, 4],
    }

    handleHome();

    homeSteps.forEach((step, index) => {
      setActions(index);
    })

    function setActions(step) {
      const homeStep = homeSteps[step];
      homeStep.actions.forEach((action, index) => {
        document.getElementById(`btn-${step}-${index}`).onclick = action;
      });
    }

    document.querySelectorAll('.step').forEach((step) => {
      step.onclick = bottomStepsToggle;
    })

    function handleHome() {
      if (state.getActiveSpreadsheet()) {
        loadSpreadsheetsTable();
        toggleSteps(0, 4);
      };
    }

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


    function reloadHome() {
      home.innerHTML = '';
      loadHome();
    }

    function toggleSteps(from, to) {
      if (to === 4) {
        checkIcon.classList.add('green');
        setDisabledBottomStep(1, false);
        setDisabledBottomStep(2, false);
      } else {
        checkIcon.classList.remove('green');
      }
      if (to === 0) {
        state.deactivateAllSpreadsheets();
        state.clearSpreadsheet();
        reloadHome();
      } else {
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

    function setSheetTitle() {
      const btn1Zero = document.getElementById('btn-1-0');
      if (inputNewSheetTitle.value !== '') {
        insertLeftCornerLabel(inputNewSheetTitle, 'check', 'green', 'disabled')
        btn1Zero.classList.add('disabled');
        document.getElementById('add-column-title').classList.remove('display-none');
      } else {
        insertLeftCornerLabel(inputNewSheetTitle, 'close', 'red', 'enabled');
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

      columnList.push({ title: inputNewColumnTitle.value, index: columnIndex });
      item.id = `column-${columnIndex}`;
      i.id = `delete-${columnIndex}`;
      columnIndex += 1;

      inputNewColumnTitle.value = '';
      inputNewColumnTitle.focus();

      columnListHtml.appendChild(item);

      i.onclick = deleteColumnTitle;

      btnOneTwo();
    }

    function deleteColumnTitle(event) {
      const id = +event.target.id.match(regAfterHyphen)[0];
      const elementId = `column-${id}`;

      columnList.forEach((title, index) => {
        if (title.index === id) {
          columnList.splice(index, 1);
        }
      });

      const element = document.getElementById(elementId);
      element.remove();

      btnOneTwo();
    }

    function btnOneTwo() {
      columnList.length > 0
        ? btn1Two.classList.remove('display-none')
        : btn1Two.classList.add('display-none');
    }

    function saveColumnsAndGo() {
      state.getSpreadsheet().values = [columnList.map((column) => column.title)];
      setSelectedColumnOptions();
      toggleSteps(...navigation.createSheetToMainColumn);
    }

    function setSelectedColumnOptions() {
      selectColumns.innerHTML = '<option value="">Colunas</option>';
      $('.ui.dropdown').dropdown();
      const values = state.getSpreadsheet().values[0];
      values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectColumns.appendChild(option);
      });
    }

    function setMainColumn() {
      const btn3Zero = document.getElementById('btn-3-0');
      const btn3One = document.getElementById('btn-3-1');
      const btn3Two = document.getElementById('btn-3-2');
      if (selectColumns.value !== '') {
        isExistingSheet
          ? btn3Two.classList.remove('display-none')
          : btn3One.classList.remove('display-none');
        btn3Zero.classList.add('disabled');
        warningContainer.classList.add('display-none');
        state.getSpreadsheet().mainColumn = selectColumns.value;
      } else {
        warningContainer.classList.remove('display-none');
      }
      selectColumns.onchange = (event) => {
        btn3Zero.classList.remove('disabled');
        btn3One.classList.add('display-none');
      };
    }

    function selectExistingSheet(event) {
      const input = document.getElementById('existing-sheet-url');
      const url = input.value.split('/');
      if (url[0] === 'https:' && url[2] === 'docs.google.com' && url[3] === 'spreadsheets') {
        const spreadsheetId = url[5];
        event.target.classList.add('loading');
        getSpreadsheet(spreadsheetId).then((response) => {
          if (response.status === 200) {
            insertLeftCornerLabel(input, 'check', 'green', 'enabled');
            state.getSpreadsheet().title = response.result.properties.title;
            state.getSpreadsheet().spreadsheetUrl = response.result.spreadsheetUrl;
            state.getSpreadsheet().spreadsheetId = response.result.spreadsheetId;
            loadIndexRowsSelect(response.result.sheets[0].data[0].rowData);
          }
          event.target.classList.remove('loading');
        });
        warningContainer.classList.add('display-none');
      } else {
        warningContainer.classList.remove('display-none');
        warningMessage.textContent = 'Url inválida.';
      }
    }

    function loadIndexRowsSelect(rowData) {
      const selectContainer = document.getElementById('sheet-rows');
      selectContainer.classList.remove('display-none');

      const select = document.getElementById('select-rows');

      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Linha de referência';
      select.appendChild(option);
      $('#select-rows').dropdown();

      rowData.forEach((row, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = index + 1;
        select.appendChild(option);
      });

      const btn2One = document.getElementById('btn-2-1');
      btn2One.onclick = () => {
        const values = [];
        rowData[select.value].values.forEach((value, index) => {
          value.formattedValue ? values.push(value.formattedValue) : values.push('');
        });
        state.getSpreadsheet().values = [values];
        state.getSpreadsheet().range = findRange(+select.value + 1, values.length);
        setSelectedColumnOptions();
        toggleSteps(...navigation.existingSheetToMainColumn);
      };
    }

    function findRange(line, columns) {
      let columnPosition = columns;
      let pointer = 0;
      while (columnPosition > alphabetUp.length) {
        pointer += 1;
        columnPosition -= alphabetUp.length;
      }
      let range = `A${line}:`;
      if (pointer - 1 >= 0) range += alphabetUp[pointer - 1];
      range += alphabetUp[columnPosition - 1]
      return range;
    }

    function createElementTd(textContent) {
      const td = document.createElement('td');
      td.textContent = textContent;
      return td;
    }

    function createSpreadsheet(event) {
      event.target.classList.add('loading');
      createSheet(state.getSpreadsheet().title)
        .then((result) => {
          state.getSpreadsheet().spreadsheetId = result.spreadsheetId;
          state.getSpreadsheet().spreadsheetUrl = result.spreadsheetUrl;

          putSpreadsheetData('A1', state.getSpreadsheet().spreadsheetId, state.getSpreadsheet().values[0])
            .then((result) => {
              state.getSpreadsheet().values = result.updatedData.values;

              state.getSpreadsheet().range = result.updatedData.range.replace(/[0-9]$/, '');

              insertLocalSheet();
              loadSpreadsheetsTable();

              toggleSteps(...navigation.mainColumnToFinished);

              event.target.classList.remove('loading');
            })
        })
    }

    function addSpreadsheet() {
      insertLocalSheet();
      loadSpreadsheetsTable();
      toggleSteps(...navigation.mainColumnToFinished);
    }

    function insertLocalSheet() {
      state.addSpreadsheetInSpreadsheetList();
      updateLocalStorage();
    }

    function removeLocalSheet(index) {
      state.removeSpreadsheetOfSpreadsheetList(index);
      updateLocalStorage();
      reloadHome();
    }

    function selectSpreadsheet(index) {
      state.setActiveSpreadsheet(index);
      updateLocalStorage();
      reloadHome();
    }

    function updateLocalStorage() {
      localStorage.setItem('spreadsheets', JSON.stringify(state.getSpreadsheetsList()));
    }

    function loadSpreadsheetsTable() {
      const tbody = document.getElementById('tbody-data');
      state.getSpreadsheetsList().forEach((spreadsheet, index) => {

        const tr = document.createElement('tr');

        const td = document.createElement('td');
        td.classList.add('left', 'aligned', 'collapsing');
        td.style.textAlign = 'right';
        tr.appendChild(td);

        const button = document.createElement('button');
        button.classList.add('circular', 'ui', 'icon', 'button', 'negative');
        button.id = `remove-spreadsheet-${index}`;

        const i = document.createElement('i');
        i.classList.add('icon', 'close');
        button.appendChild(i);

        button.onclick = removeSpreadsheet;

        td.appendChild(button);

        const td2 = document.createElement('td');
        td2.classList.add('collapsing');
        tr.appendChild(td2);

        const i2 = document.createElement('i');
        i2.classList.add('file', 'alternate', 'icon');
        td2.appendChild(i2);

        const nodeTextContent = document.createTextNode(spreadsheet.spreadsheet.title);
        td2.appendChild(nodeTextContent);

        const td3 = document.createElement('td');
        td3.classList.add('spreadsheetUrl');
        td3.textContent = spreadsheet.spreadsheet.spreadsheetUrl;
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.classList.add('right', 'aligned', 'collapsing');

        if (spreadsheet.active) {
          const i = document.createElement('i');
          i.classList.add('circular', 'check', 'large', 'icon', 'green');
          td4.appendChild(i);
        } else {
          const button = document.createElement('button');
          button.classList.add('ui', 'button', 'positive', 'circular');
          button.id = `set-selected-${index}`;
          button.textContent = 'Selecionar';
          td4.appendChild(button);
          button.onclick = setSelectedSpreadsheet;
        };
        tr.appendChild(td4);
        tbody.appendChild(tr);
      });
    }

    function removeSpreadsheet(event) {
      const id = +event.currentTarget.id.match(regAfterHyphen)[0];
      removeLocalSheet(id);
    }

    function setSelectedSpreadsheet(event) {
      const id = +event.target.id.match(regAfterHyphen)[0];
      selectSpreadsheet(id);
    }
  });
}

function loadList() {
  $('#list').load(`${baseUrl}list.html`, () => {

    const listData = document.getElementById('list-data');
    const formData = document.getElementById('form-data');
    const menuBtnCancel = document.getElementById('menu-btn-cancel');
    const menuBtnSave = document.getElementById('menu-btn-save');
    const btnSave = document.getElementById('btn-save');
    const btnAddNewRow = document.getElementById('btn-add-new-row');

    menuBtnCancel.classList.add('display-none');
    menuBtnSave.classList.add('display-none');
    menuBtnSignOut.classList.remove('display-none');

    menuBtnCancel.onclick = toggleFormOrList;
    btnSave.onclick = upsertRow;
    btnAddNewRow.onclick = newRow;

    listRows();

    async function listRows() {
      isLoading(true);
      getSpreadsheetRows(state.getSpreadsheet().spreadsheetId, state.getSpreadsheet().range)
        .then((result) => {
          listObjects(state.setSheetObjects(arrayToObject(result.values)));
          isLoading(false);
        })
        .catch((error) => {
          error.message;
          isLoading(false);
        })
    }

    function arrayToObject(rows) {
      const rowsObject = [];

      rows.forEach((row, index, array) => {
        if (index === 0) return;
        const object = {}

        for (let i = 0; i < array[0].length; i++) {
          object[array[0][i]] = row[i] || '';
        }

        rowsObject.push(object)
      });
      return rowsObject;
    }

    function listObjects(rowsObject) {
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
      label.textContent = value[state.getSpreadsheet().mainColumn];
      label.classList.add('header');
      checkboxContainer.appendChild(label);
    }

    function addBtnShow(divItem, index) {
      const btnContainer = document.createElement('div');
      btnContainer.classList.add('right', 'floated', 'content');
      divItem.appendChild(btnContainer);

      const buttonShow = document.createElement('div');
      buttonShow.classList.add('ui', 'button', 'circular');
      buttonShow.id = `btn-${index}`;
      buttonShow.textContent = 'Mostrar dados';
      btnContainer.appendChild(buttonShow);

      buttonShow.onclick = showData;
    }

    function showData(event) {
      const id = event.target.id.match(regNumbers)[0];
      btnSave.name = id;
      Object.entries(state.setTempObject(id)).forEach((item) => {
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
      state.updateTempObject(key, event.target.value);
    }

    function toggleFormOrList() {
      menuBtnCancel.classList.toggle('display-none');
      menuBtnSave.classList.toggle('display-none');
      menuBtnSignOut.classList.toggle('display-none');
      btnAddNewRow.classList.toggle('display-none');

      if (listData.classList.contains('display-none')) {
        listData.classList.remove('display-none');
      } else {
        listData.classList.add('display-none');
      }
      if (formData.classList.contains('display-none')) {
        formData.classList.remove('display-none');
        //enableFixedMenu();
      } else {
        formData.innerHTML = '';
        //disableFixedMenu();
        formData.classList.add('display-none');
      }
    }

    async function upsertRow(event) {
      const id = +event.target.name;
      const regLastNumbers = /[0-9]+$/;
      let range = state.getSpreadsheet().range.split(':')[0].match(regLastNumbers)[0];
      range = `A${+range + (id + 1)}`;
      const response = await putSpreadsheetData(
        range,
        state.getSpreadsheet().spreadsheetId,
        Object.values(state.getTempObject())
      );
      loadList();
    }

    function newRow() {
      const id = state.getSheetObjects().length;
      btnSave.name = id;
      Object.entries(state.newTempObject()).forEach((entry) => {
        createInput(id, 'text', entry);
      });
      toggleFormOrList()
    }

  });
}

function loadHowToUse() {
  $('#how-to-use').load(`${baseUrl}how-to-use.html`, () => {

  });
}

/* function enableFixedMenu() {
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
} */

function isLoading(enabled) {
  const loading = document.getElementById('loading');
  enabled ? loading.classList.remove('display-none') : loading.classList.add('display-none');
}
