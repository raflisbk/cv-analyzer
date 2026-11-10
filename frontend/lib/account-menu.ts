import { sanitizeUrl } from "@/lib/sanitize";

type AccountIdentity = { name: string | null; email: string };

export function accountDisplayName(user: AccountIdentity): string {
  return user.name?.trim() || user.email;
}

export function accountInitial(user: AccountIdentity): string {
  return accountDisplayName(user).charAt(0).toUpperCase();
}

export function accountShortName(user: AccountIdentity): string {
  return accountDisplayName(user).split(/\s|@/)[0];
}

export function accountPhotoUrl(picture: string | null): string | null {
  if (!picture) {
    return null;
  }
  const safeUrl = sanitizeUrl(picture);
  return /^https?:\/\//i.test(safeUrl) ? safeUrl : null;
}
