export class Spreadsheet {
  constructor (
    id = '',
    title = '',
    url = '',
    range = '',
    columns = [],
    active = false,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.range = range;
    this.columns = columns;
    this.active = active;
  }

  clearSpreadsheet() {
    this = new Spreadsheet();
  };

  


}