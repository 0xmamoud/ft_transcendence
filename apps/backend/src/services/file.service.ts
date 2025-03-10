import fs from "node:fs/promises";
import path from "path";
import { FastifyInstance } from "fastify";

export class FileService {
  /**
   * Détecte le type de fichier image à partir de son buffer
   */
  getImageFileType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    // JPEG/JPG commence par FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "jpg";
    }
    // PNG commence par 89 50 4E 47
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "png";
    }
    // GIF commence par 47 49 46 38
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return "gif";
    }
    // WebP commence par 52 49 46 46
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46
    ) {
      return "webp";
    }

    return null;
  }

  async saveFile(
    buffer: Buffer,
    subdirectory: string,
    filename: string
  ): Promise<string> {
    const dir = path.join(process.cwd(), "public", subdirectory);
    await fs.mkdir(dir, { recursive: true });

    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, buffer);

    return `/public/${subdirectory}/${filename}`;
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      const fullPath = path.join(
        process.cwd(),
        "public",
        filepath.replace(/^\/public\//, "")
      );
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn(`Failed to delete file ${filepath}:`, error);
    }
  }

  async saveAvatar(buffer: Buffer, userId: number): Promise<string> {
    const fileType = this.getImageFileType(buffer);
    if (!fileType) {
      throw new Error(
        "Invalid image format. Only JPG, PNG, GIF, and WebP are supported."
      );
    }

    const timestamp = Date.now();
    const filename = `avatar_${userId}_${timestamp}.${fileType}`;

    return await this.saveFile(buffer, "avatars", filename);
  }

  async deleteOldAvatar(avatarPath: string | null): Promise<void> {
    if (!avatarPath || avatarPath.startsWith("http")) return;
    await this.deleteFile(avatarPath);
  }
}
