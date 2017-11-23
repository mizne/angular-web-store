export interface StorageServiceError {
  code: number
  message: string
}

export const SESSION_STORAGE_NOTSUPPORTED: StorageServiceError = {
  code: 100,
  message: 'Session storage not supported!'
}
export const LOCAL_STORAGE_NOTSUPPORTED: StorageServiceError = {
  code: 200,
  message: 'Local storage not supported!'
}
export const UNKNOWN_STORAGE_TYPE: StorageServiceError = {
  code: 300,
  message: 'Unknown storage type!'
}