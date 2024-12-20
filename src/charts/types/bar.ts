import Chart from 'chart.js/auto';
import type { ChartDataset } from 'chart.js/auto';

import UrbisSurveyChart, { type legendPosition, type legendAlignment } from '$charts/base/urbis-survey-chart';

class BarChart extends UrbisSurveyChart {
  /**
   * Legends for the current chart. Optional. Used for a grouped bar chart
   */
  legends: Array<string>;

  /**
   * Minimum color lighten percentage from the base color
   */
  barColorLightenMinPercent: number;

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

    const legendsEl: HTMLElement | null = chartWrapper.querySelector(this.CHART_LEGENDS_SELECTOR);
    this.legends = this.extractDataAsString(legendsEl);

    // If no legend is defined, add a default one
    if (0 === this.legends.length) {
      this.hasLegends = false;
      this.legends.push('Value');
    }

    this.populateChartValuesList();

    this.barColorLightenMinPercent = Number(this.chartWrapper?.getAttribute('data-chart-color-min-lighten')) || 30;

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
            barPercentage: 0.95, // Reduce gap between bars
            categoryPercentage: 0.95 // Reduce category spacing
          },
        },
        layout: {
          padding: {
            left: 0,  // Minimize left padding
            right: 8  // Small right padding for percentage values
          }
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
              display: false,
              drawTicks: true,
            },
            border: {
              display: false,
            },
            min: 0,
            max: 100,
          },
          y: {
            stacked: this.isStacked,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              padding: 4,
              // using traditional function call instead of arrow function to preserve `this` context and pass it on
              callback: function (val) {
                return barChartClass.getYAxisLabelWidth(val, this);
              },
              crossAlign: 'far',
              autoSkip: false,
              maxRotation: 0, // Prevent label rotation
              z: 1 // Ensure labels are drawn above grid lines
            },
            afterFit: (scale) => {
              scale.width = scale.chart.width * this.getResponsiveScaleWidth();
              // Add a small offset to bring bars closer to labels
              scale.left = scale.left - 8;
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
              // don't display labels for a values less than 5
              const value = context.dataset.data[context.dataIndex];
              return this.shouldDisplayDatalabel(value as number);
            },
            formatter: (value) => {
              return `${value}%`;
            },
            labels: this.getLabelObject(),
            anchor: () => (this.isStacked ? 'center' : 'end'),
            align: () => (this.isStacked ? 'center' : 'start'),
            color: () => this.getDatalabelColor()
          },
        },
      },
    });

    return this.chartInstance;
  }

  protected generateDataset(): Array<ChartDataset> {
    const dataset: Array<ChartDataset> = [];

    for (let i = 0; i < this.legends.length; i++) {
      dataset.push({
        label: this.legends[i],
        data: this.chartValuesList[i],
        backgroundColor: this.getBackgroundColorShades(i, this.legends.length),
        barThickness: 'flex',
        barPercentage: 1,
        borderWidth: 0,
      });
    }

    return dataset;
  }
}

export default BarChart;
