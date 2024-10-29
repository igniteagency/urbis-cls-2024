import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import TableChart from './components/table-data';
import VimeoVideoControls from './components/vimeo-video-player';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.gsap.registerPlugin(ScrollTrigger);

window.Webflow?.push(() => {
  new VimeoVideoControls();
  new TableChart();
});
