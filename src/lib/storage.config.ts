import { InjectionToken } from '@angular/core'

export interface ActionNotifyOptions {
  set?: boolean
  get?: boolean
  remove?: boolean
  clear?: boolean
}

export class SetAction {
  constructor(public key: string, public value: any, public expiredIn: string) {}
}
export class GetAction {
  constructor(public key: string) {}
}
export class RemoveAction {
  constructor(public key: string) {}
}
export class ClearAction {
}

export interface StorageConfig {
  prefix?: string
  expiredIn?: string
  actionNotify?: ActionNotifyOptions
}

export const STORAGE_CONFIG = new InjectionToken('STORAGE_CONFIG')

export type Actions = SetAction | GetAction | RemoveAction | ClearAction
