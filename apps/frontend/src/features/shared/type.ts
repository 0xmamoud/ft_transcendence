export interface UserPublicProfile {
  username: string;
  avatar: string | null;
}

export interface UserProfile extends UserPublicProfile {
  email: string;
}
