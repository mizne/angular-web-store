import { Injectable, Inject } from '@angular/core'
import { ms } from './ms'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import {
  ANGULAR_WEB_STORE_CONFIG,
  AngularWebStoreConfig,
  ActionNotifyOptions,
  Actions,
  SetAction,
  GetAction,
  RemoveAction,
  ClearAction
} from './storage.config'

import {
  AngularWebStoreError,
  SESSION_STORAGE_NOT_SUPPORTED,
  LOCAL_STORAGE_NOT_SUPPORTED,
  UNKNOWN_STORAGE_TYPE
} from './storage.errors'

export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

const EXPIRED_AT = '@@EXPIRED_AT'
const STOREAGE_VALUE = '@@STORAGE_VALUE'

export class StorageService {
  private storage: Storage
  private prefix: string
  private expiredMs: number
  private actionNotify: ActionNotifyOptions

  public errors: Subject<AngularWebStoreError> = new Subject<
    AngularWebStoreError
  >()
  public actions: Subject<Actions> = new Subject<Actions>()

  constructor(private storageType: StorageType, private config: AngularWebStoreConfig) {
    this.initConfig(config)
    this.initStorage(storageType)
  }

  set(key: string, value: any, expiredIn?: string): void {
    this.notifyAction(SetAction.TYPE, new SetAction(key, value, expiredIn))

    const expiredMs = this.computeExpiredMs(expiredIn)
    this.storage.setItem(
      this.computeKey(key),
      JSON.stringify({
        [EXPIRED_AT]: expiredMs === -1 ? -1 : +new Date() + expiredMs,
        [STOREAGE_VALUE]: value
      })
    )
  }

  private computeExpiredMs(expiredIn: string): number {
    return expiredIn ? ms(expiredIn) : this.expiredMs
  }

  private computeKey(originalKey: string): string {
    return `${this.prefix}__${originalKey}`
  }

 get(key: string): any {
    this.notifyAction(GetAction.TYPE, new GetAction(key))
    try {
      const obj = JSON.parse(this.storage.getItem(this.computeKey(key)) || 'null')
      if (this.isValidValue(obj)) {
        if (this.unExpired(obj[EXPIRED_AT])) {
          return obj[STOREAGE_VALUE]
        } else {
          this.storage.removeItem(this.computeKey(key))
          return null
        }
      }
      return null
    } catch (e) {
      return null
    }
  }

  private isValidValue(obj: any): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj[EXPIRED_AT] === 'number'
    )
  }

  private unExpired(mills: number): boolean {
    return mills === -1 || mills >= +new Date()
  }

  remove(key: string): void {
    this.notifyAction(RemoveAction.TYPE, new RemoveAction(key))
    this.storage.removeItem(this.computeKey(key))
  }

  clear() {
    this.notifyAction(ClearAction.TYPE, new ClearAction())
    this.storage.clear()
  }

  private notifyAction(action: string, actionArgs: Actions) {
    if (this.actionNotify[action]) {
      try {
        this.actions.next(actionArgs)
      } catch (e) {
        this.errors.next({ code: 500, message: e.message })
      }
    }
  }

  private initConfig(config: AngularWebStoreConfig): void {
    this.prefix = config.prefix || 'MIZNE'
    this.expiredMs = config.expiredIn ? ms(config.expiredIn) : -1
    this.actionNotify = config.actionNotify || {}
  }

  private initStorage(storageType: StorageType): void {
    switch (storageType) {
      case StorageType.LOCAL:
        if (this.checkSupport(storageType)) {
          this.storage = window[storageType]
        } else {
          this.errors.next(LOCAL_STORAGE_NOT_SUPPORTED)
        }
        break
      case StorageType.SESSION:
        if (this.checkSupport(storageType)) {
          this.storage = window[storageType]
        } else {
          this.errors.next(SESSION_STORAGE_NOT_SUPPORTED)
        }
        break
      default:
        this.errors.next(UNKNOWN_STORAGE_TYPE)
        break
    }
  }

  private checkSupport(storageType: StorageType): boolean {
    try {
      if (storageType in window && window[storageType] !== null) {
        const webStorage = window[storageType]
        const key = `${this.prefix}_CHECK_SUPPORT`
        webStorage.setItem(key, '')
        webStorage.removeItem(key)
        return true
      }
    } catch (e) {
      this.errors.next({ code: 500, message: e.message })
    }
    return false
  }
}

@Injectable()
export class LocalStorageService extends StorageService {
  constructor(@Inject(ANGULAR_WEB_STORE_CONFIG) config: AngularWebStoreConfig) {
    super(StorageType.LOCAL, config)
  }
}

@Injectable()
export class SessionStorageService extends StorageService {
  constructor(@Inject(ANGULAR_WEB_STORE_CONFIG) config: AngularWebStoreConfig) {
    super(StorageType.SESSION, config)
  }
}
