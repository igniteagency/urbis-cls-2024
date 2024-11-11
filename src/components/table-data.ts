class TableChart {
  TABLE_COMPONENT_SELECTOR = '[data-el="table-data-component"]';
  TABLE_DATA_NUMBER_SELECTOR = '[data-el="table-data-number"]';

  constructor() {
    this.setCellValues();
  }

  /**
   * Sets a CSS custom property on each table cell equal to the value of the cell
   */
  private setCellValues() {
    document.querySelectorAll(this.TABLE_DATA_NUMBER_SELECTOR).forEach((cellEl) => {
      cellEl.style.setProperty('--_value', cellEl.textContent);
    });
  }
}

export default TableChart;
