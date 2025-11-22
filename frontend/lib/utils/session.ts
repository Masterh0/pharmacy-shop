export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("guestSessionId");
  if (!id) {
    id = `guest_${
      crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    }`;
    localStorage.setItem("guestSessionId", id);
  }
  return id;
}
