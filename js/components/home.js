export const loadHome = async () => {

  return fetch(`${baseUrl}/pages/home.html`)
    .then((data) => data.text())
    .then((text) => {
      console.log('home');
      
      rootContent.innerHTML = text;

      const alphabetUp = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

      let isExistingSheet = false;
      let columnList = [];
      let columnIndex = 0;

      const inputNewSheetTitle = document.getElementById('new-sheet-title');
      inputNewSheetTitle.oninput = (event) => state.tempSpreadsheet.title = event.target.value;

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

      function handleHome() {
        if (state.getActiveSpreadsheet().active) {
          loadSpreadsheetsTable();
          toggleSteps(0, 4);
        } else if (state.spreadsheetList.length > 0) {
          loadSpreadsheetsTable();
          document.getElementById(`step-3`).classList.add('active');
          setDisabledBottomStep(3, true);
        }
      }

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
          state.tempSpreadsheet.clear();
          loadHome();
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
        console.log('new sheet');
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
        state.tempSpreadsheet.columns = columnList.map((column) => column.title);
        setSelectedColumnOptions();
        toggleSteps(...navigation.createSheetToMainColumn);
      }

      function setSelectedColumnOptions() {
        selectColumns.innerHTML = '<option value="">Colunas</option>';
        $('.ui.dropdown').dropdown();
        const columns = state.tempSpreadsheet.columns;
        columns.forEach((column) => {
          const option = document.createElement('option');
          option.value = column;
          option.textContent = column;
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
          state.tempSpreadsheet.mainColumn = selectColumns.value;
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
          sheets.getSpreadsheet(spreadsheetId).then((response) => {
            if (response.status === 200) {
              insertLeftCornerLabel(input, 'check', 'green', 'enabled');
              state.tempSpreadsheet.title = response.result.properties.title;
              state.tempSpreadsheet.url = response.result.spreadsheetUrl;
              state.tempSpreadsheet.id = response.result.spreadsheetId;
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
          state.tempSpreadsheet.columns = values;
          state.tempSpreadsheet.range = findRange(+select.value + 1, values.length);
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
        sheets.createSheet(state.tempSpreadsheet.title)
          .then((result) => {
            state.tempSpreadsheet.id = result.spreadsheetId;
            state.tempSpreadsheet.url = result.spreadsheetUrl;

            sheets.putSpreadsheetData('A1', state.tempSpreadsheet.id, state.tempSpreadsheet.columns)
              .then((result) => {
                //state.tempSpreadsheet.columns = result.updatedData.values;

                state.tempSpreadsheet.range = result.updatedData.range.replace(/[0-9]$/, '');

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
      }

      function removeLocalSheet(index) {
        state.removeSpreadsheetOfSpreadsheetList(index);
        loadHome();
      }

      function selectSpreadsheet(index) {
        state.setActiveSpreadsheet(index);
        loadHome();
      }

      function loadSpreadsheetsTable() {
        const tbody = document.getElementById('tbody-data');
        state.spreadsheetList.forEach((spreadsheet, index) => {

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

          const nodeTextContent = document.createTextNode(spreadsheet.title);
          td2.appendChild(nodeTextContent);

          const td3 = document.createElement('td');
          td3.classList.add('spreadsheetUrl');
          td3.textContent = spreadsheet.url;
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
    })


}