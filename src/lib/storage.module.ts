import { NgModule, ModuleWithProviders } from '@angular/core'

import { LocalStorageService, SessionStorageService } from './storage.service'
import { AngularWebStoreConfig, ANGULAR_WEB_STORE_CONFIG } from './storage.config'

export {
  LocalStorageService,
  SessionStorageService,
  AngularWebStoreConfig,
  ANGULAR_WEB_STORE_CONFIG
}

@NgModule({
  providers: [LocalStorageService, SessionStorageService]
})
export class AngularWebStoreModule {
  static forRoot(config: AngularWebStoreConfig = {}): ModuleWithProviders {
    return {
      ngModule: AngularWebStoreModule,
      providers: [{ provide: ANGULAR_WEB_STORE_CONFIG, useValue: config }]
    }
  }
}
