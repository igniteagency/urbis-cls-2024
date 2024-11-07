import Chart from 'chart.js/auto';
import type { ChartDataset, CoreScaleOptions, Scale } from 'chart.js/auto';
import UrbisSurveyChart, { type legendPosition, type legendAlignment } from '$charts/class/urbis-survey-chart';

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
      this.getCSSVariableValue( '--color--elements--background-alternate-1'),
      this.getCSSVariableValue('--color--elements--background-alternate-2'),
      this.getCSSVariableValue('--color--elements--background-alternate-3'),
      this.getCSSVariableValue('--color--elements--background-secondary'),
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
              callback: (value) => `${value}%`,
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
              scale.width = scale.chart.width / 2.5;
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
              const { dataIndex } = context;
              return 0 !== context.dataset.data[dataIndex];
            },
            formatter: (value) => `${value}%`,
            labels: {
              title: {
                font: {
                  weight: 'bold',
                },
              },
            },
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

  protected getBackgroundColor(index: number): string {
    // get color in rotation from colorsList based on index
    return this.colorsList[index % this.colorsList.length];
  }

  protected getYTicks(value: string | number, scale: Scale<CoreScaleOptions>): string | Array<string> {
    const chartWidth: number = scale.chart.width;
    const label = scale.getLabelForValue(Number(value));

    if (!chartWidth) return label;

    const characterBreakpointValue: number = Math.round((chartWidth * (30 / 100)) / 6);
    let formattedLabel: string | Array<string> = label;

    // Break label into chunks for word wrap
    const breakpointRegex = new RegExp(`[\\s\\S]{1,${characterBreakpointValue}}(\\s|$)`, 'g');
    formattedLabel = formattedLabel.match(breakpointRegex) || [];

    return formattedLabel || value;
  }

  private setCanvasContainerHeight() {
    const bufferSpace = 30;
    const canvasContainerEl: HTMLElement | null | undefined = 
      this.chartWrapper?.querySelector(this.chartCanvasContainerSelector);

    if (!canvasContainerEl) return;

    canvasContainerEl.style.minHeight = 
      `${this.chartLabels.length * (this.maxBarThickness + bufferSpace)}px`;
  }
}

export default HorizontalStackedBarChart;