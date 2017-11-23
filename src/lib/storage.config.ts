import { InjectionToken } from '@angular/core'

export interface ActionNotifyOptions {
  set?: boolean
  get?: boolean
  remove?: boolean
  clear?: boolean
}

export class Action {
  constructor() {
  }
}

export class SetAction extends Action {
  constructor(public key: string, public value: any, public expiredIn: string) {
    super()
  }
}
export class GetAction extends Action {
  constructor(public key: string) {
    super()
  }
}
export class RemoveAction extends Action {
  constructor(public key: string) {
    super()
  }
}
export class ClearAction extends Action {
  constructor() {
    super()
  }
}

export interface AngularWebStoreConfig {
  prefix?: string
  expiredIn?: string
  actionNotify?: ActionNotifyOptions
}

export const ANGULAR_WEB_STORE_CONFIG = new InjectionToken('ANGULAR_WEB_STORE_CONFIG')

export type Actions = SetAction | GetAction | RemoveAction | ClearAction
