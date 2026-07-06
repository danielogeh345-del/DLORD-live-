export interface IAuthPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
