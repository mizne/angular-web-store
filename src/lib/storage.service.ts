import { Injectable, Inject } from '@angular/core'
import { ms } from 'ms'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import {
  STORAGE_CONFIG,
  StorageConfig,
  ActionNotifyOptions,
  Actions,
  SetAction,
  GetAction,
  RemoveAction,
  ClearAction
} from './storage.config'

import {
  StorageServiceError,
  SESSION_STORAGE_NOTSUPPORTED,
  LOCAL_STORAGE_NOTSUPPORTED,
  UNKNOWN_STORAGE_TYPE
} from './storage.errors'

export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

export class StorageService {
  private storage: Storage
  private prefix: string
  private expiredMs: number
  private actionNotify: ActionNotifyOptions

  public errors: Subject<StorageServiceError> = new Subject<
    StorageServiceError
  >()
  public actions: Subject<Actions> = new Subject<Actions>()

  constructor(private storageType: StorageType, private config: StorageConfig) {
    this.initConfig(config)
    this.initStorage(storageType)
  }

  set(key: string, value: any, expiredIn?: string): void {
    this.notifyAction('set', new SetAction(key, value, expiredIn))

    const expiredMs = this.computeExpiredMs(expiredIn)
    this.storage.setItem(
      this.computeKey(key),
      JSON.stringify({
        _expiredAt: expiredMs === -1 ? -1 : +new Date() + expiredMs,
        _value: value
      })
    )
  }

  private computeExpiredMs(expiredIn: string | undefined): number {
    return expiredIn ? ms(expiredIn) : this.expiredMs
  }

  private computeKey(originalKey: string): string {
    return `${this.prefix}__${originalKey}`
  }

 get(key: string): any {
    this.notifyAction('get', new GetAction(key))
    try {
      const value = JSON.parse(this.storage.getItem(this.computeKey(key)) || 'null')
      if (this.isValidValue(value)) {
        if (this.unExpired(value._expiredAt)) {
          return value._value
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

  private isValidValue(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value._expiredAt === 'number'
    )
  }

  private unExpired(mills: number): boolean {
    return mills === -1 || mills >= +new Date()
  }

  remove(key: string): void {
    this.notifyAction('remove', new RemoveAction(key))
    this.storage.removeItem(this.computeKey(key))
  }

  clear() {
    this.notifyAction('clear', new ClearAction())
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

  private initConfig(config: StorageConfig): void {
    this.prefix = config.prefix || 'MIZNE__'
    this.expiredMs = config.expiredIn ? ms(config.expiredIn) : -1
    this.actionNotify = config.actionNotify || {}
  }

  private initStorage(storageType: StorageType): void {
    switch (storageType) {
      case StorageType.LOCAL:
        if (this.checkSupport(storageType)) {
          this.storage = window[storageType]
        } else {
          this.errors.next(LOCAL_STORAGE_NOTSUPPORTED)
        }
        break
      case StorageType.LOCAL:
        if (this.checkSupport(storageType)) {
          this.storage = window[storageType]
        } else {
          this.errors.next(SESSION_STORAGE_NOTSUPPORTED)
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
        const key = `${this.prefix}__CHECK_SUPPORT`
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
  constructor(@Inject(STORAGE_CONFIG) config: StorageConfig) {
    super(StorageType.LOCAL, config)
  }
}

@Injectable()
export class SessionStorageService extends StorageService {
  constructor(@Inject(STORAGE_CONFIG) config: StorageConfig) {
    super(StorageType.SESSION, config)
  }
}
