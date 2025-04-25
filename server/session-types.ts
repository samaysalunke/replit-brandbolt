// Define extension for express-session
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}