import Chart from 'chart.js/auto';
import type { ChartDataset } from 'chart.js/auto';
import UrbisSurveyChart, { type legendPosition, type legendAlignment } from '$charts/base/urbis-survey-chart';
import { getCSSVar } from '$utils/getCSSVar';

class HorizontalStackedBarChart extends UrbisSurveyChart {
  /**
   * Legends for the stacked bar segments
   */
  legends: Array<string>;

  /**
   * A list of chart values for each stack segment
   */
  chartValuesList: Array<Array<number>> = [];

  colorsList: Array<string> = [];

  /**
   * Whether the bar has any legends defined
   */
  hasLegends = true;

  constructor(chartWrapper: HTMLDivElement) {
    super(chartWrapper);

    const legendsEl: HTMLElement | null = chartWrapper.querySelector(this.chartLegendsSelector);
    this.legends = this.extractDataAsString(legendsEl);

    // Add default legend if none provided
    if (0 === this.legends.length) {
      this.hasLegends = false;
      this.legends.push('Value');
    }

    this.populateChartValuesList();
    
    this.colorsList = [
      getCSSVar( '--color--elements--background-alternate-1'),
      getCSSVar('--color--elements--background-alternate-2'),
      getCSSVar('--color--elements--background-alternate-3'),
      getCSSVar('--color--elements--background-secondary'),
    ]

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
            min: 0,
            max: 100,
          },
          y: {
            stacked: true,
            grid: {
              display: false,
            },
            ticks: {
              callback: function (val) {
                return stackedBarChartClass.getYTicks(val, this);
              },
              crossAlign: 'far',
              autoSkip: false,
            },
            afterFit: (scale) => {
              scale.width = scale.chart.width / this.horizontalChartWidthQuotient;
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
            color: (context) => {
              return context.datasetIndex < 3 ? this.textDarkColor : this.textLightColor
            },
          },
        },
      },
    });

    return this.chartInstance;
  }

  protected populateChartValuesList(): void {
    const chartValuesElList: NodeListOf<HTMLElement> | undefined = 
      this.currentDataset?.querySelectorAll(this.chartValuesSelector);

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

    const chartTitle = this.getChartTitle();

    if (this.chartInstance.config.options?.plugins?.title?.text) {
      this.chartInstance.config.options.plugins.title.text = chartTitle;
    }

    this.populateChartValuesList();
    this.chartInstance.config.data.datasets = this.generateDataset();
    this.chartInstance.config.data.labels = this.chartLabels;
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
        barPercentage: 0.9,
        categoryPercentage: 0.8,
        borderWidth: 0,
      });
    }

    return dataset;
  }

  /**
   * @returns The title of chart from the HTML
   */
  private getChartTitle(): string {
    const titleEl = this.currentDataset?.querySelector(this.chartTitleSelector) as HTMLElement | null;
    return titleEl ? titleEl.innerText.trim() : '';
  }

  protected getBackgroundColor(index: number): string {
    // get color in rotation from colorsList based on index
    return this.colorsList[index % this.colorsList.length];
  }
}

export default HorizontalStackedBarChart;