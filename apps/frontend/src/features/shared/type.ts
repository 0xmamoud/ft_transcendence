export interface UserPublicProfile {
  id: number;
  username: string;
  avatar: string | null;
}

export interface UserProfile extends UserPublicProfile {
  email: string;
}
