export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
}

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEndpoint: string;
  authEndpoint: string;
  userInfoEndpoint: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}
