class MainMenu {
  ITEM_SELECTOR = '[data-el="menu-accordion"]';
  TOGGLE_SELECTOR = 'summary';
  CONTENT_SELECTOR = 'summary + div';

  ANIMATION_DURATION_IN_MS = 300;

  ANIMATION_PROGRESS_CLASSNAME = 'is-animating';

  accordionEl: HTMLDetailsElement;
  menuWrapper: HTMLDetailsElement | null;
  menuBackdrop: HTMLElement | null;

  constructor() {
    this.accordionEl = document.querySelector<HTMLDetailsElement>(
      this.ITEM_SELECTOR
    ) as HTMLDetailsElement;

    this.menuWrapper = document.querySelector('.menu_wrapper') as HTMLDetailsElement | null;
    this.menuBackdrop = document.querySelector('.menu_backdrop') as HTMLElement | null;

    if (!this.accordionEl) {
      return;
    }

    this.animateMenu();
    this.addBackdropClickListener();
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

  private addBackdropClickListener() {
    if (this.menuWrapper && this.menuBackdrop) {
      const accordionContentEl = this.menuWrapper.querySelector(this.CONTENT_SELECTOR);
      const menuLinks = this.menuWrapper.querySelectorAll('a');

      if (!accordionContentEl) {
        console.error('Accordion content not found for the backdrop click');
        return;
      }

      // Event listener for backdrop click
      this.menuBackdrop.addEventListener('click', () => {
        this.closeMenuWithAnimation(accordionContentEl);
      });

      // Event listener for menu link clicks
      menuLinks.forEach((link) => {
        link.addEventListener('click', () => {
          this.closeMenuWithAnimation(accordionContentEl);
        });
      });
    }
  }

  private closeMenuWithAnimation(contentEl: HTMLElement) {
    // todo consolidate this into a close event listener instead of duplicating code
    if (this.menuWrapper && this.menuWrapper.hasAttribute('open')) {
      const { height } = this.getMenuDimensions(contentEl);

      contentEl.classList.add(this.ANIMATION_PROGRESS_CLASSNAME);

      const animation = contentEl.animate([{ height: `${height}px` }, { height: '0px' }], {
        duration: this.ANIMATION_DURATION_IN_MS,
        fill: 'forwards',
      });

      animation.onfinish = () => {
        this.menuWrapper?.removeAttribute('open');
        contentEl.style.height = '';
        contentEl.classList.remove(this.ANIMATION_PROGRESS_CLASSNAME);
      };
    }
  }
}

export default MainMenu;
