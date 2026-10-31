const storageKey = 'guest-lesson-token';

/** A guest's server-side lesson belongs to this random token. */
export function getGuestToken(): string {
  let token = window.localStorage.getItem(storageKey);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(storageKey, token);
  }
  return token;
}

export function peekGuestToken(): string | null {
  return window.localStorage.getItem(storageKey);
}

export function clearGuestToken(): void {
  window.localStorage.removeItem(storageKey);
}
