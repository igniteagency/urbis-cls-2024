import Chart from 'chart.js/auto';
import type { ChartDataset } from 'chart.js/auto';
import UrbisSurveyChart, { type legendPosition, type legendAlignment } from '$charts/base/urbis-survey-chart';

class HorizontalStackedBarChart extends UrbisSurveyChart {
  /**
   * Legends for the stacked bar segments
   */
  legends: Array<string>;

  /**
   * Whether the bar has any legends defined
   */
  hasLegends = true;

  constructor(chartWrapper: HTMLDivElement) {
    super(chartWrapper);

    const legendsEl: HTMLElement | null = chartWrapper.querySelector(this.CHART_LEGENDS_SELECTOR);
    this.legends = this.extractDataAsString(legendsEl);

    // Add default legend if none provided
    if (0 === this.legends.length) {
      this.hasLegends = false;
      this.legends.push('Value');
    }

    this.populateChartValuesList();

    this.setCanvasContainerHeight();
  }

  public init() {
    if (!this.chartCanvas) return undefined;

    // Context alias for ticks callback
    const stackedBarChartClass = this;

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
            stacked: true,
            ticks: {
              display: false,
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            min: 0,
            max: 100,
          },
          y: {
            stacked: true,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              callback: function (val, index) {
                return stackedBarChartClass.getYAxisLabelWidth(val, this);
              },
              crossAlign: 'far',
              autoSkip: false,
            },
            afterFit: (scale) => {
              scale.width = scale.chart.width * this.getResponsiveScaleWidth();
            },
          },
        },
        plugins: {
          legend: {
            display: this.hasLegends,
            position: <legendPosition>(
              this.chartWrapper?.getAttribute('data-legends-position') || this.defaultLegendPosition
            ),
            align: <legendAlignment>(
              this.chartWrapper?.getAttribute('data-legends-align') || this.defaultLegendAlignment
            ),
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
              const value = context.dataset.data[context.dataIndex];
              return this.shouldDisplayDatalabel(value as number);
            },
            formatter: (value) => `${value}%`,
            labels: this.getLabelObject(),
            anchor: 'center',
            align: 'center',
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
        barPercentage: 0.9,
        categoryPercentage: 0.8,
        borderWidth: 0,
      });
    }

    return dataset;
  }
}

export default HorizontalStackedBarChart;