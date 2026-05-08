(() => {
  const SELECTOR = "#cr-glacier-wide video[data-closeread-video='glacier']";
  const PAUSE_DELAY_MS = 1500;

  const state = {
    hasUserGesture: false,
    playedOnce: false,
    pauseTimer: null
  };

  const markUserGesture = () => {
    state.hasUserGesture = true;
    document.removeEventListener("pointerdown", markUserGesture);
    document.removeEventListener("keydown", markUserGesture);
    document.removeEventListener("touchstart", markUserGesture);
  };

  const startWithSound = async (video) => {
    video.muted = false;
    try {
      await video.play();
      state.pauseTimer = window.setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, PAUSE_DELAY_MS);
    } catch (error) {
      video.muted = true;
      await video.play();
      video.pause();
      video.currentTime = 0;
    }
  };

  const handleIntersection = (video) => (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        if (state.pauseTimer) {
          window.clearTimeout(state.pauseTimer);
          state.pauseTimer = null;
        }
        video.pause();
        return;
      }

      if (state.playedOnce) {
        return;
      }

      if (!state.hasUserGesture) {
        return;
      }

      state.playedOnce = true;
      startWithSound(video);
    });
  };

  const init = () => {
    const video = document.querySelector(SELECTOR);
    if (!video) {
      return;
    }

    video.controls = true;
    video.loop = false;

    document.addEventListener("pointerdown", markUserGesture, { once: true });
    document.addEventListener("keydown", markUserGesture, { once: true });
    document.addEventListener("touchstart", markUserGesture, { once: true });

    const observer = new IntersectionObserver(handleIntersection(video), {
      threshold: 0.6
    });

    observer.observe(video);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
