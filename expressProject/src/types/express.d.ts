// types/express.d.ts
import { Types } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: Types.ObjectId;
    cookies: {
      CSRF_TOKEN?: string;
      [key: string]: string | undefined;
    };
    signedCookies: {
      SESSION_ID?: string;
      [key: string]: string | undefined;
    };
  }
}
