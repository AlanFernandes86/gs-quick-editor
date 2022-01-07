export class Spreadsheet {
  constructor (
    id = '',
    title = '',
    url = '',
    range = '',
    columns = [],
    status = false,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.range = range;
    this.columns = columns;
    this.status = status;
  }

  clearSpreadsheet() {
    this = new Spreadsheet();
  };

  


}