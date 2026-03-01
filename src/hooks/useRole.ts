export function useRole() {
  const role = sessionStorage.getItem("role");
  const isGuest = role === "guest";
  return { role, isGuest };
}