import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import { IntroAnimation } from './components/intro';
import TableChart from './components/table-data';
import VimeoVideoControls from './components/vimeo-video-player';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.gsap.registerPlugin(ScrollTrigger);
window.SplitType = SplitType;

window.Webflow?.push(() => {
  new VimeoVideoControls();
  new TableChart();
  IntroAnimation();
});
