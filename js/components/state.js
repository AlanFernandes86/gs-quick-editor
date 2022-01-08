export class State {

  constructor() {
    this.spreadsheetList = new Array();
    this.sheetRows = new Array();
  }

  getSpreadsheetsList() {
    return this.spreadsheetList;
  }

  getActiveSpreadsheet() {
    return this.spreadsheetList.find((spreadsheet) => spreadsheet.active) || {};
  }

  setSpreadsheetsList(value) {
    this.spreadsheets = value;
    return this.spreadsheets;
  }

  deactivateAllSpreadsheets() {
    this.spreadsheets.forEach((spreadsheet) => spreadsheet.active = false);
  }
}

export const state = () => new State();