export class Row {
  constructor(...entries) {
    entries.forEach(([key, value]) => this[key] = value || '');
  }

  /**
   * @param {string | number} key
   */
  set cell(key, value) {
    this[key] = value;
  }

  get cell(key) {
    return this[key];
  }

}