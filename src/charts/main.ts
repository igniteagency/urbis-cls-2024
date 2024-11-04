import type Chart from 'chart.js/auto';

export type legendPosition = 'top' | 'left' | 'bottom' | 'right';
export type legendAlignment = 'start' | 'center' | 'end';

abstract class UrbisSurveyChart {
  chartWrapper: HTMLDivElement | null;
  chartCanvas: HTMLCanvasElement | null;
  chartLabels: Array<string>;
  chartValues: Array<number>;
  chartInstance: Chart | null = null;
  hasChartDataToggle = false;
  currentDataset: HTMLElement | null;

  /**
   * Default position of the legends for this chart.
   * Can be overwritten with the attribute `data-legends-position` on the `chartWrapper` element
   */
  defaultLegendPosition: legendPosition = 'top';

  /**
   * Default alignment of the legends for this chart.
   * Can be overwritten with the attribute `data-legends-align` on the `chartWrapper` element
   */
  defaultLegendAlignment: legendAlignment = 'center';

  /**
   * Main color of the pie chart; used as the starting color
   */
  chartColor: string;

  /**
   * Maximum bar thickness
   */
  maxBarThickness = 50;

  /**
   * Maximum rotation angle of the chart ticks
   */
  maxLabelRotation = 90;

  // CSS selectors of all the important chart elements
  chartValuesSelector = '.chart_values';
  chartLabelsSelector = '.chart_labels';
  chartLegendsSelector = '.chart_legends';
  chartCanvasContainerSelector = '.chart_canvas-container';
  chartCanvasSelector = '.chart_canvas';
  chartTitleSelector = '.chart_title';
  chartDataWrapperSelector = '.chart_data';
  chartDatasetWrapperSelector = '.chart_dataset-wrapper';
  chartDataToggleSelector = '.chart_data-toggle';

  protected abstract toggleChartData(): void;

  constructor(chartWrapper: HTMLDivElement) {
    this.chartWrapper = chartWrapper;
    this.chartCanvas = chartWrapper.querySelector(this.chartCanvasSelector);

    const chartLabelsEl: HTMLElement | null =
      chartWrapper.querySelector(`${this.chartLabelsSelector}[data-chart-label-primary="true"]`) ||
      chartWrapper.querySelector(this.chartLabelsSelector);

    this.currentDataset = chartWrapper.querySelector(this.chartDatasetWrapperSelector);

    this.chartLabels = this.extractDataAsString(chartLabelsEl);

    this.chartValues = this.extractDataAsNumber(
      chartWrapper.querySelector(this.chartValuesSelector)
    );
    this.chartColor = chartWrapper.getAttribute('data-chart-color') || '#4CC3B1';

    this.hasChartDataToggle =
      chartWrapper.querySelectorAll(this.chartDataToggleSelector).length > 0;

    if (!this.currentDataset) {
      console.error('No dataset wrapper element found for chart - ', { chartWrapper });
      return;
    }

    if (this.hasChartDataToggle) {
      this.setChartDataToggleListener();
    }
  }

  protected setChartDataToggleListener() {
    this.chartWrapper
      ?.querySelectorAll(this.chartDataToggleSelector)
      .forEach((toggleEl, toggleIndex) => {
        toggleEl.addEventListener('click', (ev) => {
          const toggleInstance: number = toggleIndex + 1;
          const targetEl = ev.target as HTMLElement;

          this.currentDataset =
            this.chartWrapper?.querySelector(
              `${this.chartDataWrapperSelector} > ${this.chartDatasetWrapperSelector}:nth-of-type(${toggleInstance})`
            ) || null;

          if (!this.currentDataset) {
            console.error(
              `No dataset found for ${this.chartDatasetWrapperSelector} ${toggleInstance} instance`,
              this.chartWrapper
            );
          }

          try {
            // init child class toggleChartData function
            this.toggleChartData();
            this.setChartDataToggleActiveClass(targetEl);
          } catch (e) {
            console.error('No `toggleChartData` function found in chart ', this.chartWrapper, {
              e,
            });
          }
        });
      });

    // Initial click
    const initTargetEl =
      (this.chartWrapper?.querySelector(
        `${this.chartDataToggleSelector}:nth-of-type(1)`
      ) as HTMLElement) || null;
    this.setChartDataToggleActiveClass(initTargetEl);
  }

  protected setChartDataToggleActiveClass(targetEl: HTMLElement | null) {
    if (!targetEl) {
      console.error('No target element found for setting toggle active class', { targetEl });
      return;
    }

    // remove active class from the previous toggle
    this.chartWrapper
      ?.querySelector(`${this.chartDataToggleSelector}.is-active`)
      ?.classList.remove('is-active');

    targetEl?.classList.add('is-active'); // add active class to the current toggle
  }

  protected extractDataAsString(el: HTMLElement | null) {
    // remove any extra unusual multiple spaces from the string
    if (!el) return [];
    const dataList: Array<string> = el.innerText.replace(/\s+/g, ' ').split('|');

    // trim the data and return
    return dataList.map((data) => data.trim());
  }

  protected extractDataAsNumber(el: HTMLElement | null) {
    return el
      ? el.innerText
          .trim()
          .split('|')
          .map((value) => Number(value))
      : [];
  }
}

export default UrbisSurveyChart;
