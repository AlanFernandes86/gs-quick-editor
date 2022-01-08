import { Row } from '../model/row.js';

export const loadList = async () => {
 
    return fetch(`${baseUrl}pages/list.html`)
    .then((data) => data.text())
    .then((text) => {

      rootContent.innerHTML = text;

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
        google.getSpreadsheetRows(state.tempSpreadsheet.id, state.tempSpreadsheet.range)
          .then((result) => {
            createListRowsUI(state.sheetRows = arrayToRows(result.values));
            isLoading(false);
          })
          .catch((error) => {
            error.message;
            isLoading(false);
          })
      }
  
      function arrayToRows(arrayRows) {
        const rowsObject = [];
  
        arrayRows.forEach((arrayRow, index, array) => {
          if (index === 0) return;
          const row = new Row();
  
          for (let i = 0; i < array[0].length; i++) {
            row.setCell([array[0][i]], arrayRow[i] || '');
          }
          
          rowsObject.push(row)
        });
      
        return rowsObject;
      }
  
      function createListRowsUI(sheetRows) {
        const list = document.getElementById('list-data');
        list.innerHTML = ''
        sheetRows.forEach((row, index) => {
          const divItem = document.createElement('div');
          divItem.classList.add('item');
          list.appendChild(divItem);
          addBtnShow(divItem, index);
          addCheckbox(divItem, row, index);
        });
  
        $('.ui.checkbox').checkbox();
      }
  
      function addCheckbox(divItem, row, index) {
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
        label.textContent = row[state.tempSpreadsheet.mainColumn];
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
        Object.entries(state.setRow(id)).forEach((item) => {
          createInput(id, 'text', item);
        });
        toggleFormOrList();
  
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
        let range = state.tempSpreadsheet.range.split(':')[0].match(regLastNumbers)[0];
        range = `A${+range + (id + 1)}`;
        const response = await google.putSpreadsheetData(
          range,
          state.tempSpreadsheet.id,
          Object.values(state.row)
        );
        loadList();
      }
  
      function newRow() {
        const id = state.sheetRows.length;
        btnSave.name = id;
        Object.entries(state.newRow()).forEach((entry) => {
          createInput(id, 'text', entry);
        });
        toggleFormOrList()
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
        state.updateRow(key, event.target.value);
      }

    });


}