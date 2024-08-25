import { Context as HonoContext } from 'hono'

declare module 'hono' {
  interface ContextVariables {
    jwtPayload: {
      userId: number;
    };
  }
}