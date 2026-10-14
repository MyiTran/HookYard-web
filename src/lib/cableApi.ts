import { API_URL } from "../config";
import { apiRequest, type ApiResult } from "./apiRequest";

export type CableTicketResponse = {
  token: string;
  expires_at: string;
};

export function requestCableTicket(): Promise<ApiResult<CableTicketResponse>> {
  return apiRequest<CableTicketResponse>("/cable_ticket", "POST");
}

export function buildCableUrl(token: string): string {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/cable";
  url.search = "";
  url.searchParams.set("ticket", token);

  return url.toString();
}
