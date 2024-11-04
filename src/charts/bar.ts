import type Chart from 'chart.js/auto';
import type { ChartDataset, CoreScaleOptions, Scale } from 'chart.js/auto';

import { lighten } from '$utils/colorLighten';
import UrbisSurveyChart, { type legendPosition, type legendAlignment } from '$charts/main';

class BarChart extends UrbisSurveyChart {
  /**
   * Legends for the current chart. Optional. Used for a grouped bar chart
   */
  legends: Array<string>;

  /**
   * A list of chart values, for each legend
   */
  chartValuesList: Array<Array<number>> = [];

  /**
   * Minimum color lighten percentage from the base color
   */
  chartColorLightenMinPercent: number;

  /**
   * Defines whether the bar chart is stacked or not
   */
  isStacked: boolean;

  /**
   * Whether the bar has any legends defined or not
   */
  hasLegends = true;

  constructor(chartWrapper: HTMLDivElement) {
    super(chartWrapper);

    const legendsEl: HTMLElement | null = chartWrapper.querySelector(this.chartLegendsSelector);
    this.legends = this.extractDataAsString(legendsEl);

    // If no legend is defined, add a default one
    if (0 === this.legends.length) {
      this.hasLegends = false;
      this.legends.push('Value');
    }

    this.populateChartValuesList();

    this.chartColorLightenMinPercent = Number(this.chartWrapper?.getAttribute('data-chart-color-min-lighten')) || 30;

    this.isStacked = 'true' === chartWrapper.getAttribute('data-bar-stacked') || false;

    this.setCanvasContainerHeight();
  }

  public init() {
    if (!this.chartCanvas) return undefined;

    // context alias used for ticks callback function, because we also need its own contextual `this` to use an inbuilt function
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const barChartClass = this;

    this.chartInstance = new Chart(this.chartCanvas, {
      type: 'bar',
      data: {
        labels: this.chartLabels,
        datasets: this.generateDataset(),
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        datasets: {
          bar: {
            maxBarThickness: this.maxBarThickness,
          },
        },
        scales: {
          x: {
            stacked: this.isStacked,
            ticks: {
              display: false,
              callback: (index) => {
                // only show the 0 value border
                if (0 === index) {
                  return '';
                }
                return null;
              },
            },
            grid: {
              // display: false,
              drawBorder: false,
              drawTicks: true,
            },
            min: 0,
            max: 100,
          },
          y: {
            stacked: this.isStacked,
            grid: {
              display: false,
            },
            ticks: {
              // using traditional function call instead of arrow function to preserve `this` context and pass it on
              callback: function (val) {
                return barChartClass.getYTicks(val, this);
              },
              crossAlign: 'far',
              autoSkip: false,
            },
            afterFit: (scale) => {
              scale.width = scale.chart.width / 2.5; // 25% of chart's width
            },
          },
        },
        plugins: {
          legend: {
            display: this.hasLegends ? true : false,
            position:
              <legendPosition>this.chartWrapper?.getAttribute('data-legends-position') || this.defaultLegendPosition,
            align:
              <legendAlignment>this.chartWrapper?.getAttribute('data-legends-align') || this.defaultLegendAlignment,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let tooltipString = `${context.formattedValue}%`;
                if (this.hasLegends) {
                  tooltipString = `${context.dataset.label}: ${tooltipString}`;
                }
                return tooltipString;
              },
            },
          },
          datalabels: {
            display: (context) => {
              // don't display labels for a value of 0
              const { dataIndex } = context;
              return 0 !== context.dataset.data[dataIndex] ? true : false;
            },
            formatter: (value) => {
              return `${value}%`;
            },
            labels: {
              title: {
                font: {
                  weight: 'bold',
                },
              },
            },
            anchor: () => (this.isStacked ? 'center' : 'end'),
            align: () => (this.isStacked ? 'center' : 'start'),
          },
        },
      },
    });

    return this.chartInstance;
  }

  // Populates the chartValuesList for the current dataset
  protected populateChartValuesList(): void {
    const chartValuesElList: NodeListOf<HTMLElement> | undefined = this.currentDataset?.querySelectorAll(
      this.chartValuesSelector
    );

    if (chartValuesElList?.length) {
      this.chartValuesList = [];
      for (const legendValuesEl of chartValuesElList) {
        this.chartValuesList.push(this.extractDataAsNumber(legendValuesEl));
      }
    }
  }

  protected toggleChartData(): void {
    if (!this.chartInstance) {
      console.error('No chartInstance found', this.chartInstance, this.chartWrapper);
      return;
    }

    this.populateChartValuesList();
    this.chartInstance.config.data.datasets = this.generateDataset();
    this.chartInstance.update();
  }

  protected generateDataset(): Array<ChartDataset> {
    const dataset: Array<ChartDataset> = [];

    for (let i = 0; i < this.legends.length; i++) {
      dataset.push({
        label: this.legends[i],
        data: this.chartValuesList[i],
        backgroundColor: this.getBackgroundColor(i),
        barThickness: 'flex',
        barPercentage: 1,
      });
    }

    return dataset;
  }

  /**
   * Returns the color for the chart bar
   *
   * @param num The order number of legend item; starts from 0
   * @returns Default or lightened color value
   */
  protected getBackgroundColor(num: number): string {
    const color: string = this.chartColor;

    // the percent by which this chart chunk will lighten
    const lightenValue: number = (100 - this.chartColorLightenMinPercent) / this.legends.length || 0;

    return 0 === num ? color : lighten(this.chartColor, lightenValue * num);
  }

  protected getYTicks(value: string | number, scale: Scale<CoreScaleOptions>): string | Array<string> {
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

  private setCanvasContainerHeight() {
    const bufferSpace = 30;

    const canvasContainerEl: HTMLElement | null | undefined = this.chartWrapper?.querySelector(
      this.chartCanvasContainerSelector
    );

    if (!canvasContainerEl) {
      return;
    }

    canvasContainerEl.style.minHeight = `${this.chartLabels.length * (this.maxBarThickness + bufferSpace)}px`;
  }
}

export default BarChart;
