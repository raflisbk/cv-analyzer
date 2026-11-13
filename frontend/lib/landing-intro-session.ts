const INTRO_SEEN_KEY = "pathkr-intro-seen";

export function hasSeenLandingIntro(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markLandingIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    return;
  }
}
