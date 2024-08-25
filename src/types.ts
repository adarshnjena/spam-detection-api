import type { Context as HonoContext } from "hono";

export interface UserJWTPayload {
  userId: number;
}

export type Context = HonoContext & {
  get(key: "jwtPayload"): UserJWTPayload;
};
