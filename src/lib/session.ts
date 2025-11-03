import type { SessionOptions } from "iron-session";

export interface SessionData {
  teamName: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "security-challenge-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
