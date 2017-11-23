export interface AngularWebStoreError {
  code: number
  message: string
}

export const SESSION_STORAGE_NOT_SUPPORTED: AngularWebStoreError = {
  code: 100,
  message: 'Session storage not supported!'
}
export const LOCAL_STORAGE_NOT_SUPPORTED: AngularWebStoreError = {
  code: 200,
  message: 'Local storage not supported!'
}
export const UNKNOWN_STORAGE_TYPE: AngularWebStoreError = {
  code: 300,
  message: 'Unknown storage type!'
}