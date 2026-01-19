declare global {
  interface Window {
    CARE_API_URL: string;
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

const getUrl = (
  path: string,
  query?: QueryParams,
  pathParams?: Record<string, string | number>,
  baseUrl?: string,
) => {
  if (pathParams) {
    path = Object.entries(pathParams).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, `${value}`),
      path,
    );
  }
  const url = new URL(path, baseUrl || window.CARE_API_URL);
  if (query) {
    url.search = getQueryParams(query);
  }
  return url.toString();
};

const getQueryParams = (query: QueryParams) => {
  const qParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == undefined) return;
    qParams.set(key, `${value}`);
  });

  return qParams.toString();
};

export function getHeaders(additionalHeaders?: HeadersInit) {
  const headers = new Headers(additionalHeaders);
  const careAccessToken = localStorage.getItem("care_access_token")!;

  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${careAccessToken}`);

  return headers;
}

export async function getResponseBody<TData>(res: Response): Promise<TData> {
  if (!(res.headers.get("content-length") !== "0")) {
    return null as TData;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!isJson) {
    return (await res.text()) as TData;
  }

  try {
    return await res.json();
  } catch {
    return (await res.text()) as TData;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  pathParams?: Record<string, string | number>;
  queryParams?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  headers?: HeadersInit;
  baseUrl?: string;
}

export async function request<TRes>(
  path: string,
  options?: RequestOptions,
): Promise<TRes> {
  const url = getUrl(
    path,
    options?.queryParams,
    options?.pathParams,
    options?.baseUrl,
  );

  const fetchOptions: RequestInit = {
    method: options?.method || HttpMethod.GET,
    headers: getHeaders(options?.headers),
    signal: options?.signal,
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await getResponseBody<TRes>(res);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }

  return data;
}
