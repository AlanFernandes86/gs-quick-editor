export class Row {
  constructor(...entries) {
    entries.forEach(([key, value]) => this[key] = value || '');
  }

  /**
   * @param {string | number} key
   */
  setCell(key, value) {
    this[key] = value;
  }

  getCell(key) {
    return this[key];
  }

}