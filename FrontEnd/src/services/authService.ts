import { API_ENDPOINTS } from "@/constants/api.config";
import type { Permission, User } from "@/interfaces/user.types";
import { mapRoleName } from "@/interfaces/user.types";
import { apiClient } from "@/lib/api";

interface LoginRequest {
  email: string;
  password: string;
}

/** Shape of the JWT payload issued by the backend */
interface JwtPayload {
  sub: string;
  accountId: number;
  role: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

/** Shape returned by POST /api/users/auth/login */
interface BackendLoginResponse {
  token: string;
  type: string;
  message: string;
  ttl: number;
  /** Unix timestamp in milliseconds */
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * Decode a JWT without verifying the signature (signature is verified by the backend).
 * Only used to extract claims quickly on the client side.
 */
function decodeJwt(token: string): JwtPayload {
  const payloadBase64 = token.split(".")[1];
  // Replace URL-safe chars and add padding so atob() works
  const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(atob(padded)) as JwtPayload;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Step 1: Authenticate
    const loginRes = await apiClient.post<BackendLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    const { token, expiresIn } = loginRes.data;

    // Step 2: Decode JWT to get accountId, role, permissions
    const payload = decodeJwt(token);
    console.log("Decoded JWT payload:", payload);
    // Step 3: Fetch full profile to get fullName, active status etc.
    let fullName = payload.sub; // email as fallback display name
    let isActive = true;

    try {
      const profileRes = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(payload.accountId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = profileRes.data as {
        fullName?: string;
        active?: boolean;
      };
      if (profile.fullName) fullName = profile.fullName;
      if (profile.active !== undefined) isActive = profile.active;
    } catch {
      // Non-admin roles may not have GET /users/{id} permission — proceed with JWT claims
    }

    const user: User = {
      id: payload.accountId,
      email: payload.sub,
      fullName,
      role: mapRoleName(payload.role),
      roleName: payload.role,
      allPermissions: payload.permissions,
      isActive,
    };

    return { user, token, expiresIn };
  },

  /** Logout is client-side only — no dedicated backend endpoint in the current schema */
  logout: async (): Promise<void> => {
    // Nothing to call on the backend; store/UI handles clearing state
  },
};
