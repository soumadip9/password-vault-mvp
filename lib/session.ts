import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  cookieName: "vault_session",
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};


export type SessionUser = { userId: string; email: string };
