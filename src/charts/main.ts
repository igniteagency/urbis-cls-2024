import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import BarChart from '$charts/bar';
import HorizontalDeviationChart from '$charts/horizontal-deviation';
import StackedBarChart from '$charts/stacked-bar';

class ChartJSInit {
  chartEls: Array<Chart>;
  charts: NodeListOf<HTMLDivElement> | null;

  colorPrimaryText: string;

  scrollTriggerRefreshTimer: number | undefined;

  constructor() {
    this.colorPrimaryText = getComputedStyle(document.documentElement).getPropertyValue(
      '--color--elements--text-primary'
    );

    this.chartEls = [];
    this.charts = document.querySelectorAll('.chart_chart');

    this.init();

    // this.appendScriptsAndInit();
  }

  public init() {
    if (!this.charts) return;

    // increase legend spacing; only works when the legend is at the top
    // @link: https://stackoverflow.com/a/67723827/4827398
    const increaseLegendSpacing = {
      id: 'increase-legend-spacing',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      beforeInit(chart: any) {
        // Get reference to the original fit function
        const originalFit = chart.legend.fit;

        // Override the fit function
        chart.legend.fit = function fit() {
          // Call original function and bind scope in order to use `this` correctly inside it
          originalFit.bind(chart.legend)();
          this.height += 25;
        };
      },
    };

    /**
     * Resets ScrollTrigger calculation on chart render
     */
    const resetScrollTrigger = {
      id: 'reset-scrolltrigger',
      afterRender: () => {
        if (this.scrollTriggerRefreshTimer) {
          return;
        }

        this.scrollTriggerRefreshTimer = setTimeout(() => {
          window.ScrollTrigger.refresh();
          this.scrollTriggerRefreshTimer = undefined;
        }, 1000);
      },
    };

    // register the data labels plugin for all charts
    Chart.register(ChartDataLabels, increaseLegendSpacing, resetScrollTrigger);

    // Chart Fonts
    Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue(
      '--font--body'
    );

    // Chart text color
    Chart.defaults.color = this.colorPrimaryText;

    // Axis line color
    Chart.defaults.scale.grid.color = 'rgba(0, 0, 0, 0)';

    // Default bar datalabel color - Urbis Black
    Chart.defaults.set('plugins.datalabels', {
      color: this.colorPrimaryText,
    });

    // Gap between tooltip color box and label text
    Chart.defaults.plugins.tooltip.boxPadding = 4;

    // Legends
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
    Chart.defaults.plugins.legend.labels.boxHeight = 12;
    Chart.defaults.plugins.legend.labels.padding = 20;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = 'rect';

    this.setDefaultFontSize();
    this.setResizeFontSizeListener();

    // init charts
    this.charts.forEach((chart) => {
      const chartType = chart.getAttribute('data-chart-type');

      switch (chartType) {
        case 'bar':
          new BarChart(chart).init();
          break;

        case 'horizontal-deviation':
          new HorizontalDeviationChart(chart).init();
          break;

        case 'stacked-bar':
          new StackedBarChart(chart).init();
          break;

        default:
          console.error('No defined chart type found on', chart);
          break;
      }
    });
  }

  private setDefaultFontSize() {
    if (479 > window.innerWidth) {
      Chart.defaults.font.size = 10;
    } else if (768 > window.innerWidth) {
      Chart.defaults.font.size = 12;
    } else if (991 > window.innerWidth) {
      Chart.defaults.font.size = 14;
    } else if (992 <= window.innerWidth) {
      Chart.defaults.font.size = 16;
    }
  }

  private setResizeFontSizeListener() {
    window.Webflow ||= [];
    window.Webflow.resize.on(() => {
      this.setDefaultFontSize();
    });
  }
}

export default ChartJSInit;