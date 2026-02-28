import { Request } from 'express';

export type JwtUserPayload = {
  sub: string;
  email: string;
  accountType: string;
};

export interface AuthRequest extends Request {
  user: JwtUserPayload;
}