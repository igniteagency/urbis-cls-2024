import type Chart from 'chart.js/auto';
import type { ChartDataset, CoreScaleOptions, Scale } from 'chart.js/auto';
import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
import type { LabelOptions } from 'chartjs-plugin-datalabels/types/options';

import type { ColorThemes } from '$types/global';
import { lighten } from '$utils/colorLighten';

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
   * A list of chart values for each stack segment
   */
  chartValuesList: Array<Array<number>> = [];

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
   * Can be overwritten with the attribute `data-chart-color` on the `chartWrapper` element
   */
  chartColor: string;

  /**
   * Minimum color lighten percentage from the base color
   * Can be overwritten with the attribute `data-bar-color-min-lighten` on the `chartWrapper` element
   */
  barColorLightenMinPercent: number;

  /**
   * Maximum bar thickness
   */
  maxBarThickness = 50;

  /**
   * Maximum rotation angle of the chart ticks
   */
  maxLabelRotation = 90;

  // CSS selectors of all the important chart elements
  CHART_VALUES_SELECTOR = '.chart_values';
  CHART_LABELS_SELECTOR = '.chart_labels';
  CHART_LABELS_INSTANCE_SELECTOR = '[data-chart-label-instance]';
  CHART_LEGENDS_SELECTOR = '.chart_legends';
  CHART_CANVAS_CONTAINER_SELECTOR = '.chart_canvas-container';
  CHART_CANVAS_SELECTOR = '.chart_canvas';
  CHART_TITLE_SELECTOR = '.chart_title';
  CHART_DATA_WRAPPER_SELECTOR = '.chart_data';
  CHART_DATASET_WRAPPER_SELECTOR = '.chart_dataset-wrapper';
  CHART_DATA_TOGGLE_SELECTOR = '.chart_data-toggle';
  CHART_SOURCE_TEXT_SELECTOR = '[data-el="chart-source-text"]';

  TOGGLE_ACTIVE_CLASSNAME = 'is-active';

  /**
   * Dynamic chart colors that invert as per theme
   */
  textDarkColor: string;
  textLightColor: string;

  chartLabelsList: NodeListOf<HTMLElement>;
  sourceTextElList: NodeListOf<HTMLElement>;

  activeToggle: number = 1;

  /**
   * 25% of chart's width
   */
  horizontalChartWidthQuotient = 2.5;

  protected abstract generateDataset(): Array<ChartDataset>;

  constructor(chartWrapper: HTMLDivElement) {
    this.chartWrapper = chartWrapper;
    this.chartCanvas = chartWrapper.querySelector(this.CHART_CANVAS_SELECTOR);

    this.chartLabelsList =
      chartWrapper.querySelectorAll(
        `${this.CHART_LABELS_SELECTOR}[data-chart-label-primary="true"]`
      ) || chartWrapper.querySelectorAll(this.CHART_LABELS_SELECTOR);

    this.currentDataset = chartWrapper.querySelector(this.CHART_DATASET_WRAPPER_SELECTOR);

    this.chartLabels = this.extractDataAsString(this.chartLabelsList[0]);

    this.chartValues = this.extractDataAsNumber(
      chartWrapper.querySelector(this.CHART_VALUES_SELECTOR)
    );

    this.sourceTextElList = chartWrapper.querySelectorAll(this.CHART_SOURCE_TEXT_SELECTOR);

    this.chartColor = chartWrapper.getAttribute('data-chart-color') || window.colors.chart2024Dark;

    this.textDarkColor = window.colors.darkTextStatic;
    this.textLightColor = window.colors.lightTextStatic;

    this.hasChartDataToggle =
      chartWrapper.querySelectorAll(this.CHART_DATA_TOGGLE_SELECTOR).length > 0;

    this.barColorLightenMinPercent =
      Number(this.chartWrapper?.getAttribute('data-bar-color-min-lighten')) || 30;

    if (!this.currentDataset) {
      console.error('No dataset wrapper element found for chart - ', { chartWrapper });
      return;
    }

    if (this.hasChartDataToggle) {
      this.setChartDataToggleListener();
    }

    document.addEventListener('themeChange', (ev) => {
      this.onThemeChange((ev as CustomEvent).detail);
    });

    // init color theme trigger
    this.onThemeChange(window.currentTheme);
  }

  protected setChartDataToggleListener() {
    this.chartWrapper
      ?.querySelectorAll(this.CHART_DATA_TOGGLE_SELECTOR)
      .forEach((toggleEl, toggleIndex) => {
        toggleEl.addEventListener('click', (ev) => {
          const toggleInstance: number = toggleIndex + 1;
          const targetEl = ev.target as HTMLElement;

          this.activeToggle = toggleIndex + 1;

          this.currentDataset =
            this.chartWrapper?.querySelector(
              `${this.CHART_DATA_WRAPPER_SELECTOR} > ${this.CHART_DATASET_WRAPPER_SELECTOR}:nth-of-type(${toggleInstance})`
            ) || null;

          if (!this.currentDataset) {
            console.error(
              `No dataset found for ${this.CHART_DATASET_WRAPPER_SELECTOR} ${toggleInstance} instance`,
              this.chartWrapper
            );
          }

          if (this.chartLabelsList[toggleIndex]) {
            this.chartLabels = this.extractDataAsString(this.chartLabelsList[toggleIndex]);
          }

          try {
            // init child class toggleChartData function
            this.toggleChartData();
            this.setChartToggleActiveClass(targetEl);
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
        `${this.CHART_DATA_TOGGLE_SELECTOR}:nth-of-type(1)`
      ) as HTMLElement) || null;
    this.setCurrentToggleSourceText();
    this.setChartToggleActiveClass(initTargetEl);
  }

  protected setChartToggleActiveClass(targetEl: HTMLElement | null) {
    if (!targetEl) {
      console.error('No target element found for setting toggle active class', { targetEl });
      return;
    }

    // remove active class from the previous toggle
    this.chartWrapper
      ?.querySelector(`${this.CHART_DATA_TOGGLE_SELECTOR}.${this.TOGGLE_ACTIVE_CLASSNAME}`)
      ?.classList.remove(this.TOGGLE_ACTIVE_CLASSNAME);

    targetEl?.classList.add(this.TOGGLE_ACTIVE_CLASSNAME); // add active class to the current toggle
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

  protected getLabelObject(): _DeepPartialObject<Record<string, LabelOptions | null>> {
    return {
      title: {
        font: {
          weight: 'bold',
        },
      },
    };
  }

  protected onThemeChange(currentTheme: ColorThemes) {
    if (currentTheme === 'dark') {
      this.textDarkColor = window.colors.lightTextStatic;
      this.textLightColor = window.colors.darkTextStatic;
    } else {
      this.textDarkColor = window.colors.darkTextStatic;
      this.textLightColor = window.colors.lightTextStatic;
    }

    if (!this.chartInstance) {
      return;
    }

    this.chartInstance.options.plugins.title.color = this.textDarkColor;
    this.chartInstance.options.plugins.legend.labels.color = this.textDarkColor;
    this.chartInstance.options.scales.x.ticks.color = this.textDarkColor;
    this.chartInstance.options.scales.y.ticks.color = this.textDarkColor;
    this.chartInstance.options.scales.x.title.color = this.textDarkColor;
    this.chartInstance.options.scales.y.title.color = this.textDarkColor;

    // console.log('chart update on theme change', { currentTheme });
    this.chartInstance?.update();
  }

  /**
   * Responsive text wrapping on the Y axis
   */
  protected getYTicks(
    value: string | number,
    scale: Scale<CoreScaleOptions>
  ): string | Array<string> {
    const chartWidth: number = scale.chart.width;
    const label = scale.getLabelForValue(Number(value));

    if (!chartWidth) return label;

    const characterBreakpointValue: number = Math.round((chartWidth * (30 / 100)) / 6);

    let formattedLabel: string | Array<string> = label;

    // break label into chunks of defined breakpoints characters to enable word wrap
    const breakpointRegex = new RegExp(`[\\s\\S]{1,${characterBreakpointValue}}(\\s|$)`, 'g');
    formattedLabel = formattedLabel.match(breakpointRegex) || [];

    return formattedLabel || value;
  }

  /**
   * Sets canvas height for horizontal bar charts
   */
  protected setCanvasContainerHeight() {
    const bufferSpace = 30;

    const canvasContainerEl: HTMLElement | null | undefined = this.chartWrapper?.querySelector(
      this.CHART_CANVAS_CONTAINER_SELECTOR
    );

    if (!canvasContainerEl) {
      return;
    }

    canvasContainerEl.style.minHeight = `${this.chartLabels.length * (this.maxBarThickness + bufferSpace)}px`;
  }

  // Populates the chartValuesList for the current dataset
  protected populateChartValuesList(): void {
    const chartValuesElList: NodeListOf<HTMLElement> | undefined =
      this.currentDataset?.querySelectorAll(this.CHART_VALUES_SELECTOR);

    if (chartValuesElList?.length) {
      this.chartValuesList = [];
      for (const legendValuesEl of chartValuesElList) {
        this.chartValuesList.push(this.extractDataAsNumber(legendValuesEl));
      }
    }
  }

  /**
   * triggers on chart toggle switch
   * @param toggleInstance starting from 1
   */
  protected toggleChartData() {
    if (!this.chartInstance) {
      console.error('No chartInstance found', this.chartInstance, this.chartWrapper);
      return;
    }

    const chartTitle = this.getChartTitle();

    if (this.chartInstance.config.options?.plugins?.title?.text) {
      this.chartInstance.config.options.plugins.title.text = chartTitle;
    }

    this.setCurrentToggleSourceText();

    this.populateChartValuesList();
    this.chartInstance.config.data.datasets = this.generateDataset();
    this.chartInstance.config.data.labels = this.chartLabels;
    this.chartInstance.update();
  }

  /**
   * @returns The title of chart from the HTML
   */
  protected getChartTitle(): string {
    const titleEl = this.currentDataset?.querySelector(
      this.CHART_TITLE_SELECTOR
    ) as HTMLElement | null;
    return titleEl ? titleEl.innerText.trim() : '';
  }

  /**
   * Whether to show the datalabel value on the bar or not
   * Hides datalabels if the value is between -5 and 5
   * @param value datalabel value
   */
  protected shouldDisplayDatalabel(value: number) {
    if (value <= 5 && value >= -5) {
      return false;
    }
    return true;
  }

  protected getDatalabelColor() {
    return this.activeToggle === 1 ? window.colors.lightTextStatic : window.colors.darkTextStatic;
  }

  /**
   * Returns the color for the chart bar
   *
   * @param num The order number of legend item; starts from 0
   * @returns Default or lightened color value
   */
  protected getBackgroundColorShades(num: number, legends: number): string {
    const color: string = this.activeToggle === 1 ? this.chartColor : window.colors.chart2022Dark;

    // the percent by which this chart chunk will lighten
    const lightenValue: number = (100 - this.barColorLightenMinPercent) / legends || 0;

    return 0 === num ? color : lighten(color, lightenValue * num);
  }

  protected setCurrentToggleSourceText() {
    const currentToggleSourceTextEl = this.sourceTextElList[this.activeToggle - 1];
    if (this.sourceTextElList.length > 1 && currentToggleSourceTextEl) {
      this.sourceTextElList.forEach((el) => {
        el.style.display = 'none';
      });
      currentToggleSourceTextEl.style.display = 'block';
    }
  }
}

export default UrbisSurveyChart;
