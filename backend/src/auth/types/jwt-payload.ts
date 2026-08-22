export interface JwtPayload {
  sub: number;
  username: string;
  email?: string | null;
  status: string;
}
