export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem("bk_pat", token);
  else sessionStorage.removeItem("bk_pat");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("bk_pat");
}
