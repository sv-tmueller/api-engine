export interface EndpointDef {
  id: string;
  slug: string;
  name: string;
  method: string;
  function_body: string;
  created_at: string;
  updated_at: string;
}

export interface EndpointReq {
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string;
}

export interface EndpointResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}
