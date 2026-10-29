import { API_URL } from "../config";

export async function signOut(): Promise<void> {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/auth/sign_out`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Authorization": token || "",
    },
  }).catch(() => undefined);

  localStorage.removeItem("token");
  window.location.href = "/users/sign_in";
}
