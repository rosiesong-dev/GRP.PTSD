export function useRole() {
  const role = sessionStorage.getItem("role");

  const isGuest = role === "guest";
  const isNoUpdate = role === "no_update";

  return {
    role,
    isGuest,
    isNoUpdate,
  };
}