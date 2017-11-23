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

  // @ActionNotify({
  //   enable: thisArg => thisArg.actionNotify.set,
  //   actionArgs: (key, value, expiredIn) => new SetAction(key, value, expiredIn),
  //   actions$: thisArg => thisArg.actions,
  //   errors$: thisArg => thisArg.errors
  // })
  set(key: string, value: any, expiredIn?: string): void {
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
    return `${this.prefix}__originalKey`
  }

  // @ActionNotify({
  //   enable: thisArg => thisArg.actionNotify.get,
  //   actionArgs: key => new GetAction(key),
  //   actions$: thisArg => thisArg.actions,
  //   errors$: thisArg => thisArg.errors
  // })
  get(key: string): any {
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

  // @ActionNotify({
  //   enable: thisArg => thisArg.actionNotify.remove,
  //   actionArgs: key => new RemoveAction(key),
  //   actions$: thisArg => thisArg.actions,
  //   errors$: thisArg => thisArg.errors
  // })
  remove(key: string): void {
    this.storage.removeItem(this.computeKey(key))
  }

  // @ActionNotify({
  //   enable: thisArg => thisArg.actionNotify.clear,
  //   actionArgs: () => new ClearAction(),
  //   actions$: thisArg => thisArg.actions,
  //   errors$: thisArg => thisArg.errors
  // })
  clear() {
    this.storage.clear()
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

function ActionNotify(options: {
  enable: (thisArg: any) => boolean
  actionArgs: (...args: any[]) => Actions
  actions$: (thisArg: any) => Subject<Actions>
  errors$: (thisArg: any) => Subject<StorageServiceError>
}) {
  return function(target: any, name: string, descriptor: any) {
    const originalFn = descriptor.value

    descriptor.value = function(...args: any[]) {
      if (options.enable(this)) {
        try {
          options.actions$(this).next(options.actionArgs(...args))
        } catch (e) {
          options.errors$(this).next({ code: 500, message: e.message })
        }
      }

      return originalFn.apply(this, args)
    }
  }
}
