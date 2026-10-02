import fs from 'fs';
import path from 'path';
import { IStorageProvider, StorageUploadResult } from './storage.provider.interface';
import { env } from '../../config/env';

export class LocalStorageProvider implements IStorageProvider {
  getFileUrl(filename: string): string {
    return `${env.PUBLIC_URL}/uploads/${filename}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<StorageUploadResult> {
    return {
      url: this.getFileUrl(file.filename),
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(env.UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }
}
