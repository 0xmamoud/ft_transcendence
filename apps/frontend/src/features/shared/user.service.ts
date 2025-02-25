import { UserProfile, UserPublicProfile } from "@/features/shared/type";

export class UserService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch("/api/users/me");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user profile");
    }

    return data as UserProfile;
  }

  async getUserPublicProfile(userId: string): Promise<UserPublicProfile> {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user public profile");
    }

    return data as UserPublicProfile;
  }
}

export const userService = new UserService();
