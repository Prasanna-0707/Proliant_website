// =====================================================
// SHARED HTTP CLIENT
//
// One place for: base URL, auth token, JSON handling and
// error handling. Two token stores exist because there are
// two kinds of sessions:
//
//   "staff"     -> Admin, HR, Interviewer, Hiring Manager,
//                  L0 Screener (localStorage "adminToken")
//   "candidate" -> Candidate portal (localStorage "candidateToken")
// =====================================================

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const SESSIONS = {
  staff: {
    tokenKey: "adminToken",
    userKey: "adminUser",
    loginPath: "/login",
  },
  candidate: {
    tokenKey: "candidateToken",
    userKey: "candidateUser",
    loginPath: "/candidate/login",
  },
};

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
};

export const getToken = (session = "staff") =>
  safeStorage.get(SESSIONS[session].tokenKey);

export const getStoredUser = (session = "staff") => {
  try {
    return JSON.parse(safeStorage.get(SESSIONS[session].userKey) || "null");
  } catch {
    return null;
  }
};

export const saveSession = (session, token, user) => {
  safeStorage.set(SESSIONS[session].tokenKey, token);

  if (user) {
    safeStorage.set(SESSIONS[session].userKey, JSON.stringify(user));
  }
};

export const clearSession = (session = "staff") => {
  safeStorage.remove(SESSIONS[session].tokenKey);
  safeStorage.remove(SESSIONS[session].userKey);
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const buildQuery = (params) => {
  if (!params) return "";

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });

  const query = search.toString();

  return query ? `?${query}` : "";
};

// auth: "staff" | "candidate" | false (public)
export async function apiRequest(
  path,
  { method = "GET", body, params, auth = "staff", signal, blob = false } = {}
) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken(auth);

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;

    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      null
    );
  }

  if (blob) {
    if (!response.ok) {
      const failure = await response.json().catch(() => null);

      throw new ApiError(
        failure?.message || "Unable to download the file.",
        response.status,
        failure
      );
    }

    return response.blob();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.success === false)) {
    // An expired or invalid session sends the user back to sign in.
    if (response.status === 401 && auth) {
      clearSession(auth);

      if (window.location.pathname !== SESSIONS[auth].loginPath) {
        window.location.assign(SESSIONS[auth].loginPath);
      }
    }

    throw new ApiError(
      data?.message || `Request failed (${response.status}).`,
      response.status,
      data
    );
  }

  return data;
}
