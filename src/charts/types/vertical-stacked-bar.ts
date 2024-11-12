import Chart from 'chart.js/auto';
import type { ChartDataset, ChartTypeRegistry, TooltipItem } from 'chart.js/auto';
import type { Context } from 'chartjs-plugin-datalabels';

import UrbisSurveyChart, { type legendAlignment, type legendPosition } from '$charts/base/urbis-survey-chart';

class VerticalStackedBarChart extends UrbisSurveyChart {
  /**
   * Title of the chart; if defined
   */
  chartTitle: string;

  /**
   * Legends for the current chart. Optional. Used for a grouped bar chart
   */
  legends: Array<string>;

  /**
   * The default small chart label; identified with `data-chart-label-type="small"` or without that attribute on the chart label element
   */
  chartLabelSmall: Array<string>;

  /**
   * Optional chart label with large bold fonts; identified via `data-chart-label-type="large"` attribute on the chart label element
   */
  chartLabelLarge: Array<string>;

  /**
   * Index of the middle legend value (lying on the center of x-axis)
   */
  midLegendIndex: number;

  constructor(chartWrapper: HTMLDivElement) {
    super(chartWrapper);

    const legendsEl: HTMLElement | null = chartWrapper.querySelector(this.CHART_LEGENDS_SELECTOR);
    this.legends = this.extractDataAsString(legendsEl);

    this.chartTitle = this.getChartTitle();

    const chartLabelSmallEl: HTMLElement | null =
      chartWrapper?.querySelector(`${this.CHART_LABELS_SELECTOR}[data-chart-label-type="small"]`) ||
      chartWrapper?.querySelector(`${this.CHART_LABELS_SELECTOR}:not([data-chart-label-type]`) ||
      null;

    this.chartLabelSmall = this.extractDataAsString(chartLabelSmallEl);

    const chartLabelLargeEl: HTMLElement | null =
      chartWrapper?.querySelector(`${this.CHART_LABELS_SELECTOR}[data-chart-label-type="large"]`) || null;

    this.chartLabelLarge = this.extractDataAsString(chartLabelLargeEl);

    this.chartLabels = this.chartLabelSmall.length ? this.chartLabelSmall : this.chartLabelLarge;

    this.midLegendIndex = chartWrapper.getAttribute('data-mid-legend-index')
      ? Number(chartWrapper.getAttribute('data-mid-legend-index')) - 1
      : 1;

    if (!this.chartLabels.length) {
      console.error('No chart label element found. Need one to render the chart');
      return;
    }

    this.populateChartValuesList();
  }

  /**
   * Renders the chart
   *
   * @link https://www.chartjs.org/docs/latest/samples/bar/stacked.html
   * @returns Stacked deviation bar chart instance
   */
  public init() {
    if (!this.chartCanvas || !this.currentDataset) return undefined;

    this.chartInstance = new Chart(this.chartCanvas, {
      type: 'bar',
      data: {
        labels: this.chartLabels,
        datasets: this.generateDataset(),
      },
      options: {
        // maintainAspectRatio: false,
        datasets: {
          bar: {
            maxBarThickness: this.maxBarThickness,
          },
        },
        indexAxis: 'x',
        scales: {
          x: {
            stacked: true,
            ticks: {
              display: false,
              maxRotation: this.maxLabelRotation,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          xAxisSmallLabel: this.getXAxisSmallLabels(),
          xAxisLargeLabel: this.getXAxisLargeLabels(),
          xAxisValueAverageLabel: this.getxAxisValueAverageLabels(),
          y: {
            stacked: true,
            ticks: {
              display: false,
              maxRotation: this.maxLabelRotation,
              callback: (index) => {
                // only show the 0 value border
                if (0 === index) {
                  return '';
                }
                return null;
              },
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position:
              <legendPosition>this.chartWrapper?.getAttribute('data-legends-position') || this.defaultLegendPosition,
            align:
              <legendAlignment>this.chartWrapper?.getAttribute('data-legends-align') || this.defaultLegendAlignment,
            reverse: true, // show the legends in reverse order of the datasets
            
          },
          title: {
            text: this.chartTitle,
            display: '' !== this.chartTitle ? true : false,
            font: {
              weight: 600,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${this.getBarValueLabel(context)}`;
              },
            },
          },
          datalabels: {
            formatter: (value, context) => {
              return this.getBarValueLabel(context);
            },
            display: (context) => {
              // don't display labels for a value of 0
              const value = this.getBarLegendValue(context)
              return this.shouldDisplayDatalabel(value);
            },
            labels: this.getLabelObject(),
            color: () => this.getDatalabelColor()
          },
        },
      },
    });

    return this.chartInstance;
  }

  /**
   * Generates and passes the dataset for the chart
   * @returns The dataset value for the chart
   */
  protected generateDataset(): Array<ChartDataset> {
    const dataset: Array<ChartDataset> = [];

    for (let i = this.legends.length - 1; i >= 0; i--) {
      dataset.push({
        xAxisID: 'x',
        label: this.legends[i],
        data: this.chartValuesList[i],
        borderSkipped: true,
        order: this.legends.length - i,
        backgroundColor: this.getBackgroundColorShades(i, this.legends.length),
        borderWidth: 1,
      });
    }

    return dataset;
  }

  /**
   * Fetches the original dataset value defined in HTML. Used in Tooltips and DataLabel
   * @param context chart bar context
   * @returns The original dataset value defined in HTML for the chart
   */
  private getBarValueLabel(context: Context | TooltipItem<keyof ChartTypeRegistry>): string {
    return this.getBarLegendValue(context) + '%';
  }

  private getBarLegendValue(context: Context | TooltipItem<keyof ChartTypeRegistry>): number {
    const order: number = context.dataset.order || 1;
    const orderIndex = this.legends.length - order;
    return this.chartValuesList[orderIndex][context.dataIndex];
  }

  /**
   * Adds the small lable axis at the top of the graph. Default
   * @returns The small text label
   */
  private getXAxisSmallLabels(): object {
    // hide when no definition of small labels in the markup
    if (!this.chartLabelSmall.length) {
      return {
        display: false,
      };
    }

    return {
      position: 'top',
      grid: {
        display: false,
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        maxRotation: this.maxLabelRotation,
        callback: (value: string | number, index: number) => this.chartLabels[index],
      },
    };
  }

  /**
   * Adds a large lable axis at the top of the graph. Optional
   * @returns The large text label
   */
  private getXAxisLargeLabels(): object {
    // hide when no definition of small labels in the markup
    if (!this.chartLabelLarge.length) {
      return {
        display: false,
      };
    }

    return {
      position: 'top',
      grid: {
        display: false,
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        maxRotation: this.maxLabelRotation,
        font: {
          weight: 500,
        },
        callback: (value: string | number, index: number) => this.chartLabelLarge[index],
      },
    };
  }

  /**
   * Adds another axis at the bottom of the graph for the net sentiment of a label
   * @returns The average sentiment label
   */
  private getxAxisValueAverageLabels(): object {
    return {
      position: 'bottom',
      grid: {
        display: false,
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        font: {
          weight: '700',
        },
        callback: (value: string | number, index: number) => {
          // returned as the difference between the first and last legend
          const firstLegendValue: number = this.chartValuesList[0][index];
          const lastLegendValue: number = this.chartValuesList[this.legends.length - 1][index];

          return `${firstLegendValue - lastLegendValue}%`;
        },
      },
    };
  }

  
}

export default VerticalStackedBarChart;
