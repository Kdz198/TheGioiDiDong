import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tgdd-api.kdz.asia";

function buildCurl(config: AxiosRequestConfig) {
  try {
    const method = (config.method || "get").toString().toUpperCase();
    const url = config.baseURL
      ? new URL(config.url as string, config.baseURL).toString()
      : (config.url as string);

    const parts: string[] = [`curl -X ${method} "${url}"`];

    const headers = (config.headers || {}) as Record<string, unknown>;
    Object.entries(headers).forEach(([k, v]) => {
      if (k.toLowerCase() === "common") return;
      if (k.toLowerCase() === "accept" && v == null) return;
      if (k.toLowerCase() === "content-type") return;
      const sval =
        typeof v === "string" || typeof v === "number" || typeof v === "boolean"
          ? String(v)
          : JSON.stringify(v);
      parts.push(`  -H "${k}: ${sval}"`);
    });

    if (config.data) {
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        const fd = config.data as FormData;
        for (const [key, value] of fd.entries()) {
          const val = value as unknown;
          if (typeof File !== "undefined" && val instanceof File) {
            const name = (val as File).name || "file";
            const type = (val as File).type || "application/octet-stream";
            parts.push(`  -F "${key}=@${name};type=${type}"`);
          } else if (typeof val === "string") {
            parts.push(`  -F "${key}=${val}"`);
          } else {
            parts.push(`  -F "${key}=${JSON.stringify(val)}"`);
          }
        }
      } else {
        const raw = typeof config.data === "string" ? config.data : JSON.stringify(config.data);
        parts.push(`  -H "Content-Type: application/json"`);
        const safe = raw.replace(/'/g, "'\"'\"'");
        parts.push(`  -d '${safe}'`);
      }
    }

    return parts.join(" \\\n+");
  } catch {
    return `# Failed to build cURL`;
  }
}

export const createApiInstance = (baseURL: string = API_BASE_URL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: inject JWT token and log cURL for debugging
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        config.headers = config.headers || {};
        const hdrs = config.headers as Record<string, string | number | boolean>;
        hdrs["Authorization"] = `Bearer ${token}`;
      }

      // Only log in dev or when explicit flag is set
      const shouldLog = import.meta.env.DEV || import.meta.env.VITE_DEBUG_CURL === "true";
      if (shouldLog) {
        const curl = buildCurl(config);
        try {
          console.groupCollapsed(
            `[API cURL] ${(config.method || "GET").toString().toUpperCase()} ${config.url}`
          );
          console.log(curl);
          console.groupEnd();
        } catch {
          console.log("[API cURL]", curl);
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle common errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("auth-token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiInstance();
