class TableChart {
  TABLE_COMPONENT_SELECTOR = '[data-el="table-data-component"]';
  TABLE_DATA_NUMBER_SELECTOR = '[data-el="table-data-number"]';

  constructor() {
    this.setTableHeight();
    this.setCellValues();
  }

  /**
   * Set table height, reacting to resize
   */
  private setTableHeight() {
    const tableComponentsList = document.querySelectorAll(this.TABLE_COMPONENT_SELECTOR);
    tableComponentsList.forEach((tableComponent) => {
      const tableEl = tableComponent.querySelector('table');
      if (!tableEl) {
        return;
      }

      tableComponent.style.height = `${tableEl.offsetHeight}px`;

      // use ResizeObserver
      new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const { height } = entry.contentRect;
          tableComponent.style.height = `${height}px`;
        });
      }).observe(tableEl);
    });
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
