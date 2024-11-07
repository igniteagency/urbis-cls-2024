import type { Webflow } from '@finsweet/ts-utils';

export type SCRIPTS_SOURCES = 'local' | 'cdn';

interface UrbisColors {
  darkTextStatic: string;
  lightTextStatic: string;
  chart2024Dark: string;
  chart2022Dark: string;
  chart2024Light: string;
  chart2022Light: string;
}

export type ColorThemes = 'dark' | 'default' | 'alternate';

declare global {
  interface Window {
    JS_SCRIPTS: Set<string> | undefined;
    Webflow: Webflow;

    SCRIPTS_ENV: ENV;
    setScriptSource(env: ENV): void;

    IS_DEBUG_MODE: boolean;
    setDebugMode(mode: boolean): void;

    PRODUCTION_BASE: string;

    gsap: GSAP;
    ScrollTrigger: typeof ScrollTrigger;
    SplitType: typeof SplitType;

    loadExternalScript(url: string, placement: 'head' | 'body' = 'body', defer: boolean = true): void;

    colors: UrbisColors;
  }

  // Extend `querySelector` and `querySelectorAll` function to stop the nagging of converting `Element` to `HTMLElement` all the time
  interface ParentNode {
    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
    querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>;
  }
}

export {};
