export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

export interface ProxyRequestBody {
  method: RequestMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface ProxyResponseHeaders {
  [key: string]: string;
}

export interface ProxyResponseBody {
  status: number;
  statusText: string;
  headers: ProxyResponseHeaders;
  body: string;
  elapsedMs: number;
}

export interface ProxyErrorBody {
  error: string;
}
