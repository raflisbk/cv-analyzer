import { useEffect, useLayoutEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { playIntro } from "@/components/landing/intro/play-intro";
import { playHeroScroll } from "@/components/landing/intro/play-hero-scroll";
import { playHeroEntrance } from "@/components/landing/intro/play-hero-entrance";
import {
  hasSeenLandingIntro,
  markLandingIntroSeen,
} from "@/lib/landing-intro-session";

type IntroState = {
  cancelled: boolean;
  finished: boolean;
  failsafe: number;
  intro: ReturnType<typeof playIntro>;
  scroll: ReturnType<typeof playHeroScroll> | null;
  entrance: gsap.core.Timeline | null;
};

function lockScroll() {
  const previousRestoration = history.scrollRestoration;
  const htmlOverflow = document.documentElement.style.overflow;
  const bodyOverflow = document.body.style.overflow;
  const top = () => window.scrollTo(0, 0);
  const unlock = () => {
    document.documentElement.style.overflow = htmlOverflow;
    document.body.style.overflow = bodyOverflow;
  };
  history.scrollRestoration = "manual";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  top();
  window.addEventListener("load", top);
  return {
    top,
    unlock,
    restore: () => {
      window.removeEventListener("load", top);
      history.scrollRestoration = previousRestoration;
      unlock();
    },
  };
}

function finishIntro(
  state: IntroState,
  loader: HTMLElement,
  top: () => void,
  unlock: () => void,
) {
  return () => {
    if (state.finished || state.cancelled) {
      return;
    }
    state.finished = true;
    window.clearTimeout(state.failsafe);
    state.intro?.kill();
    top();
    unlock();
    loader.style.display = "none";
    window.dispatchEvent(new Event("landing-intro-complete"));
  };
}

async function startAnimation(
  state: IntroState,
  loader: HTMLElement,
  hide: () => void,
  unlock: () => void,
) {
  const { gsap, ScrollTrigger } = await loadGsap();
  const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
  if (!hero || state.cancelled || state.finished) {
    hide();
    return;
  }
  await Promise.all([
    document.fonts.ready,
    ...Array.from(
      document.querySelectorAll<HTMLImageElement>(
        "[data-landing-loader] img, [data-landing-hero] img",
      ),
    ).map((img) => img.decode().catch(() => undefined)),
  ]);
  if (state.cancelled || state.finished) {
    return;
  }
  window.clearTimeout(state.failsafe);
  state.failsafe = window.setTimeout(hide, 5500);
  state.intro = playIntro(gsap, loader, unlock, () => {
    hide();
    if (!state.cancelled) {
      state.scroll = playHeroScroll(gsap, hero);
      ScrollTrigger.refresh();
    }
  });
}

async function startSeenAnimation(state: IntroState) {
  const { gsap, ScrollTrigger } = await loadGsap();
  const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
  if (!hero || state.cancelled) {
    return;
  }
  state.entrance = gsap.timeline();
  playHeroEntrance(state.entrance, 0);
  state.scroll = playHeroScroll(gsap, hero);
  ScrollTrigger.refresh();
}

function createIntroState(): IntroState {
  return {
    cancelled: false,
    finished: false,
    failsafe: 0,
    intro: null,
    scroll: null,
    entrance: null,
  };
}

function startSeenVisit(state: IntroState) {
  const complete = window.setTimeout(() => {
    if (!state.cancelled) {
      window.dispatchEvent(new Event("landing-intro-complete"));
    }
  }, 0);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void startSeenAnimation(state).catch(() => undefined);
  }
  return () => {
    state.cancelled = true;
    window.clearTimeout(complete);
    state.entrance?.kill();
    state.scroll?.kill();
  };
}

function startUnseenVisit(state: IntroState, loader: HTMLElement) {
  markLandingIntroSeen();
  const { top, unlock, restore } = lockScroll();
  const hide = finishIntro(state, loader, top, unlock);
  state.failsafe = window.setTimeout(hide, 5500);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hide();
  } else {
    void startAnimation(state, loader, hide, unlock).catch(hide);
  }
  return () => {
    state.cancelled = true;
    window.clearTimeout(state.failsafe);
    restore();
    state.intro?.kill();
    state.scroll?.kill();
  };
}

export function useLandingIntro() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const initiallySeen = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (initiallySeen.current === null) {
      initiallySeen.current = hasSeenLandingIntro();
    }
    if (initiallySeen.current && loaderRef.current) {
      loaderRef.current.style.display = "none";
    }
  }, []);
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) {
      return;
    }
    const state = createIntroState();
    return initiallySeen.current
      ? startSeenVisit(state)
      : startUnseenVisit(state, loader);
  }, []);
  return loaderRef;
}
