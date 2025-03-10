export interface UserPublicProfile {
  id: number;
  username: string;
  avatar: string | null | File;
}

export interface UserProfile extends UserPublicProfile {
  email: string;
}
