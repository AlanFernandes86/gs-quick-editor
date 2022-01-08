export class Spreadsheet {
  constructor (
    id = '',
    title = '',
    url = '',
    range = '',
    columns = [],
    mainColumn = '',
    active = false,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.range = range;
    this.columns = columns;
    this.mainColumn = mainColumn;
    this.active = active;
  }

  clear() {
    this.id = '';
    this.title = '';
    this.url = '';
    this.range = '';
    this.columns = [];
    this.mainColumn = '';
    this.active = false;
  };
  
}

