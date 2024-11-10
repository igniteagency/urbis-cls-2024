import Chart from 'chart.js/auto';
import type { ChartDataset, ScriptableContext } from 'chart.js/auto';

import BarChart from '$charts/types/bar';
import { lighten } from '$utils/colorLighten';

class HorizontalDeviationChart extends BarChart {
  /**
   * The amount by which each subsequent legend should lighten
   */
  colorLighten = 40;

  public init() {
    if (!this.chartCanvas) return undefined;

    // context alias used for ticks callback function, because we also need its own contextual `this` to use an inbuilt function
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const deviationBarChartClass = this;

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
              display: false,
              // drawBorder: false,
              drawTicks: true,
            },
          },
          y: {
            stacked: this.isStacked,
            grid: {
              display: false,
            },
            ticks: {
              callback: function (val) {
                return deviationBarChartClass.getYTicks(val, this);
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
            display: 1 === this.legends.length && 'Value' === this.legends[0] ? false : true,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.formattedValue}%`;
              },
            },
          },
          datalabels: {
            display: (context) => {
              // don't display labels for a values smaller than 5
              const value = context.dataset.data[context.dataIndex];
              return this.shouldDisplayDatalabel(value as number);
            },
            formatter: (value) => {
              return `${value}%`;
            },
            labels: this.getLabelObject(),
            anchor: () => (this.isStacked ? 'center' : 'end'),
            align: () => (this.isStacked ? 'center' : 'start'),
            color: () => this.getDatalabelColor(),
          },
        },
      },
    });

    return this.chartInstance;
  }

  protected generateDataset(): Array<ChartDataset> {
    return [
      {
        label: 'Value',
        data: this.extractDataAsNumber(
          this.currentDataset?.querySelector(this.chartValuesSelector) || null
        ),
        backgroundColor: (context: ScriptableContext<'bar'>) => {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          const color = this.activeToggle === 1 ? this.chartColor : window.colors.chart2022Dark;
          return 0 > value ? lighten(color, this.colorLighten) : color;
        },
        barThickness: 'flex',
        barPercentage: 1,
      },
    ];
  }
}

export default HorizontalDeviationChart;
