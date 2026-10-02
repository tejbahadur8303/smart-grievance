import { IStorageProvider } from './storage.provider.interface';
import { LocalStorageProvider } from './local.storage';

let storageInstance: IStorageProvider;

export function getStorageProvider(): IStorageProvider {
  if (!storageInstance) {
    storageInstance = new LocalStorageProvider();
  }
  return storageInstance;
}
