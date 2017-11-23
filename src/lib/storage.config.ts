import { InjectionToken } from '@angular/core'

export interface ActionNotifyOptions {
  set?: boolean
  get?: boolean
  remove?: boolean
  clear?: boolean
}

export class SetAction {
  static TYPE = 'set'
  constructor(public key: string, public value: any, public expiredIn: string) {
  }
}
export class GetAction {
  static TYPE = 'get'
  constructor(public key: string) {
  }
}
export class RemoveAction {
  static TYPE = 'remove'
  constructor(public key: string) {
  }
}
export class ClearAction {
  static TYPE = 'clear'
  constructor() {
  }
}

export interface AngularWebStoreConfig {
  prefix?: string
  expiredIn?: string
  actionNotify?: ActionNotifyOptions
}

export const ANGULAR_WEB_STORE_CONFIG = new InjectionToken('ANGULAR_WEB_STORE_CONFIG')

export type Actions = SetAction | GetAction | RemoveAction | ClearAction
