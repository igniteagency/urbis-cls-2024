import Player from '@vimeo/player';

interface VimeoPlayerItem {
  videoWrapper: HTMLDivElement;
  videoFrame: HTMLDivElement;
  player: Player;
}

/**
 * Behavior control of the vimeo video player on the site
 */
class VimeoVideoControls {
  COMPONENT_SELECTOR: string;
  VIMEO_VIDEO_WRAPPER_SELECTOR: string;
  VIDEO_OVERLAY_SELECTOR: string;
  VIDEO_LIST: NodeListOf<HTMLDivElement>;
  VIMEO_PLAYERS: VimeoPlayerItem[];

  constructor() {
    this.COMPONENT_SELECTOR = '[data-el="vimeo-video"]';
    this.VIMEO_VIDEO_WRAPPER_SELECTOR = '[data-vimeo-url]';
    this.VIDEO_OVERLAY_SELECTOR = '[data-el="vimeo-video-overlay"]';
    this.VIDEO_LIST = document.querySelectorAll(this.COMPONENT_SELECTOR);
    this.VIMEO_PLAYERS = [];

    // this.includeVimeoPlayerSDK();
    this.initVimeoPlayers();
  }

  private initVimeoPlayers() {
    this.VIDEO_LIST.forEach((videoWrapperEl) => {
      const videoFrameEl = videoWrapperEl.querySelector<HTMLDivElement>('[data-vimeo-url]');
      if (!videoFrameEl) {
        console.error('Video frame not found `', videoFrameEl, 'Looking in ', videoWrapperEl);
        return;
      }

      // Player options @link https://developer.vimeo.com/player/sdk/embed
      const player = new Player(videoFrameEl, {
        vimeo_logo: false,
        pip: false,
        chromecast: false,
        airplay: false,
        responsive: true,
      });

      const newLength = this.VIMEO_PLAYERS.push({
        videoWrapper: videoWrapperEl,
        videoFrame: videoFrameEl,
        player: player,
      });

      const videoIndex = newLength - 1;

      this.pausePlayOnViewportExit(videoIndex);
      this.handlePlayerEvents(videoIndex);
    });
  }

  private handlePlayerEvents(videoIndex: number) {
    const videoOverlayEl = this.VIMEO_PLAYERS[videoIndex].videoWrapper.querySelector(
      this.VIDEO_OVERLAY_SELECTOR
    );

    videoOverlayEl?.addEventListener('click', () => {
      this.VIMEO_PLAYERS[videoIndex].player.play();
    });

    this.VIMEO_PLAYERS[videoIndex].player.on('play', () => {
      this.VIMEO_PLAYERS[videoIndex].videoWrapper.classList.add('is-playing');
    });

    this.VIMEO_PLAYERS[videoIndex].player.on('pause', () => {
      this.VIMEO_PLAYERS[videoIndex].videoWrapper.classList.remove('is-playing');
    });
  }

  /**
   * Stop vimeo video autoplay when video exits the viewport
   */
  private pausePlayOnViewportExit(videoIndex: number) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        this.VIMEO_PLAYERS[videoIndex].player.pause();
      }
    });

    observer.observe(this.VIMEO_PLAYERS[videoIndex].videoWrapper);
  }
}

export default VimeoVideoControls;
