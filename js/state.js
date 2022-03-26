export class State {

  constructor() {
    this.spreadsheetList = new Array();
    this.sheetRows = new Array();
  }

  getSpreadsheetsList() {
    return spreadsheetList;
  }

  getActiveSpreadsheet() {
    const temp = spreadsheetList.find((spreadsheet) => spreadsheet.status) || {};
    return spreadsheet;
  }

  setSpreadsheetsList(value) {
    spreadsheets = value;
    return spreadsheets;
  }

  deactivateAllSpreadsheets() {
    spreadsheets.forEach((spreadsheet) => spreadsheet.active = false);
  }
}

export const state = () => new State();