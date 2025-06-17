export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

export interface UserPublicProfile {
  username: string;
  avatar: string | null;
}
