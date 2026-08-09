export interface JwtPayload {
  sub: string;
  email: string;
  roles: number[];
}

export interface JwtRefreshPayload extends JwtPayload {
  tokenType: 'refresh';
}
