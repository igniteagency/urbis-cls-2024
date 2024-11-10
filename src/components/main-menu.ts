class MainMenu {
  ITEM_SELECTOR = '[data-el="menu-accordion"]';
  TOGGLE_SELECTOR = 'summary';
  CONTENT_SELECTOR = 'summary + div';

  ANIMATION_DURATION_IN_MS = 300;

  ANIMATION_PROGRESS_CLASSNAME = 'is-animating';

  accordionEl: HTMLDetailsElement;

  constructor() {
    this.accordionEl = document.querySelector<HTMLDetailsElement>(
      this.ITEM_SELECTOR
    ) as HTMLDetailsElement;

    if (!this.accordionEl) {
      return;
    }

    this.animateMenu();
  }

  private animateMenu() {
    const accordionToggleEl = this.accordionEl.querySelector(this.TOGGLE_SELECTOR);
    const accordionContentEl = this.accordionEl.querySelector(this.CONTENT_SELECTOR);

    if (!accordionToggleEl || !accordionContentEl) {
      console.error('Accordion toggle or content not found', accordionToggleEl, accordionContentEl);
      return;
    }

    accordionToggleEl.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpening = !this.accordionEl.open;

      if (isOpening) {
        this.accordionEl.open = true;
        const { width, height } = this.getMenuDimensions(accordionContentEl);
        // const height = accordionContentEl.scrollHeight;
        accordionContentEl.style.height = '0px';
        // accordionContentEl.style.width = '0px';

        accordionContentEl.classList.add(this.ANIMATION_PROGRESS_CLASSNAME);

        accordionContentEl.animate(
          [
            // { height: '0px', width: '0px' },
            { height: '0px' },
            // { height: `${height}px`, width: `${width}px` },
            { height: `${height}px` },
          ],
          {
            duration: this.ANIMATION_DURATION_IN_MS,
            fill: 'forwards',
          }
        ).onfinish = () => {
          accordionContentEl.style.height = 'auto';
          // accordionContentEl.style.width = '100%';

          accordionContentEl.classList.remove(this.ANIMATION_PROGRESS_CLASSNAME);
        };
      } else {
        const { width, height } = this.getMenuDimensions(accordionContentEl);
        // const height = accordionContentEl.scrollHeight;

        accordionContentEl.classList.add(this.ANIMATION_PROGRESS_CLASSNAME);

        const animation = accordionContentEl.animate(
          [
            // { height: `${height}px`, width: `${width}px` },
            { height: `${height}px` },
            // { height: '0px', width: '0px' },
            { height: '0px' },
          ],
          {
            duration: this.ANIMATION_DURATION_IN_MS,
            fill: 'forwards',
          }
        );

        animation.onfinish = () => {
          this.accordionEl.open = false;
          accordionContentEl.style.height = '';
          // accordionContentEl.style.width = '';

          accordionContentEl.classList.remove(this.ANIMATION_PROGRESS_CLASSNAME);
        };
      }
    });
  }

  private getMenuDimensions(contentEl: HTMLElement) {
    return {
      width: contentEl.scrollWidth,
      height: contentEl.scrollHeight + 5,
    };
  }
}

export default MainMenu;
