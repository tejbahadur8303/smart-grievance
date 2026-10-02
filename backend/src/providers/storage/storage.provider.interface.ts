export interface StorageUploadResult {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IStorageProvider {
  uploadFile(file: Express.Multer.File): Promise<StorageUploadResult>;
  deleteFile(filename: string): Promise<boolean>;
  getFileUrl(filename: string): string;
}
