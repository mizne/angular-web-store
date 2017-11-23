import { NgModule, ModuleWithProviders } from '@angular/core'

import { LocalStorageService, SessionStorageService } from './storage.service'
import { StorageConfig, STORAGE_CONFIG } from './storage.config'

export {
  LocalStorageService,
  SessionStorageService,
  StorageConfig,
  STORAGE_CONFIG
}

@NgModule({
  providers: [LocalStorageService, SessionStorageService]
})
export class StorageModule {
  static forRoot(config: StorageConfig = {}): ModuleWithProviders {
    return {
      ngModule: StorageModule,
      providers: [{ provide: STORAGE_CONFIG, useValue: config }]
    }
  }
}
