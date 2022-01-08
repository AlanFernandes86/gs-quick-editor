import { Spreadsheet } from '../model/spreadsheet.js';
import { Row } from '../model/row.js';

export class State {

  constructor() {
    this._tempSpreadsheet = new Spreadsheet();
    this._spreadsheetList = new Array();
    this._sheetRows = new Array();
    this._row = new Row();
  }

  get tempSpreadsheet() {
    return this._tempSpreadsheet;
  }

  set tempSpreadsheet(value) {
    this._tempSpreadsheet = value;
    return this._tempSpreadsheet;
  }

  init() {
    if (localStorage.getItem('spreadsheets')) {
      this.setSpreadsheetList(JSON.parse(localStorage.getItem('spreadsheets')));
    }
    this._tempSpreadsheet = this.getActiveSpreadsheet();
  }

  updateLocalStorage() {
    localStorage.setItem('spreadsheets', JSON.stringify(this._spreadsheetList));
  }

  get spreadsheetList() {
    return this._spreadsheetList;
  }

  getActiveSpreadsheet() {
    const spreadsheet = this._spreadsheetList.find((spreadsheet) => spreadsheet.active) || new Spreadsheet();
    return new Spreadsheet(...Object.values(spreadsheet));
  }

  setSpreadsheetList(value) {
    this._spreadsheetList = value;
    return this._spreadsheetList;
  }

  get spreadSheetList() {
    return this._spreadsheetList;
  }

  setActiveSpreadsheet(index) {
    this._spreadsheetList.forEach((spreadsheet, i) => {
      if (index === i) {
        spreadsheet.active = true;
        this._spreadsheetList.splice(i, 1);
        this._spreadsheetList.splice(0, 0, spreadsheet);
        this._tempSpreadsheet = new Spreadsheet(...Object.values(spreadsheet));
      } else {
        spreadsheet.active = false;
      }
    });
    this.updateLocalStorage();
  }

  deactivateAllSpreadsheets() {
    this._spreadsheetList.forEach((spreadsheet) => spreadsheet.active = false);
  }

  addSpreadsheetInSpreadsheetList() {
    if (this._spreadsheetList.length > 0) {
      this.deactivateAllSpreadsheets();
    }
    this._tempSpreadsheet.active = true;
    this._spreadsheetList.push(this._tempSpreadsheet);
    this.updateLocalStorage();
  }

  removeSpreadsheetOfSpreadsheetList(index) {
    if (this._spreadsheetList[index].active && this._spreadsheetList.length > 1) {
      this._spreadsheetList.splice(index, 1);
      this._spreadsheetList[0].active = true;
    } else {
      this._spreadsheetList.splice(index, 1);
    }
    this.updateLocalStorage();
  }

  set sheetRows(value) {
    this._sheetRows = value;
    return this._sheetRows;
  }

  get sheetRows() {
    return this._sheetRows;
  }

  newRow() {
    const columns = this._tempSpreadsheet.columns;

    this._row = columns.reduce((newRow, title) => {
      newRow.setCell(title, '');
      return newRow;
    }, new Row());

    return this._row;
  }

  updateRow(key, value) {
    this._row.setCell(key, value);
    return this._row;
  }

  get row() {
    return this._row;
  }

}

export const state = () => new State();