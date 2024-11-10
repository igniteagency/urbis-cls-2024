import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import ChartJSInit from '$charts/main';
import { getCSSVar } from '$utils/getCSSVar';

import { headingReveal } from './components/heading-reveal';
import { IntroAnimation } from './components/intro';
import MainMenu from './components/main-menu';
import { revealImages } from './components/reveal-images';
import TableChart from './components/table-data';
import VimeoVideoControls from './components/vimeo-video-player';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.gsap.registerPlugin(ScrollTrigger);
window.SplitType = SplitType;

window.colors = {
  darkTextStatic: getCSSVar('--color--elements--text-dark-static'),
  lightTextStatic: getCSSVar('--color--elements--text-light-static'),
  chart2024Dark: getCSSVar('--color--elements--chart-2024-dark'),
  chart2022Dark: getCSSVar('--color--elements--chart-2022-dark'),
  chart2024Light: getCSSVar('--color--elements--chart-2024-light'),
  chart2022Light: getCSSVar('--color--elements--chart-2022-light'),
};

window.Webflow?.push(() => {
  new VimeoVideoControls();

  new TableChart();
  new ChartJSInit();

  IntroAnimation();
  new MainMenu();

  headingReveal();
  revealImages();
});
