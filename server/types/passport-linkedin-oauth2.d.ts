declare module 'passport-linkedin-oauth2' {
  import { Strategy as PassportStrategy } from 'passport';
  
  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
    };
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
    _json?: {
      headline?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    profileFields?: string[];
    state?: boolean;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any, info?: any) => void
      ) => void
    );
    
    name: string;
  }
}