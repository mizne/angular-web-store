# angular-web-store

## Installation

To install this library, run:

```bash
$ npm install angular-web-store --save
```

## Quick Start

Import the `AngularWebStoreModule` in your module.

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { AngularWebStoreModule } from 'angular-web-store';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularWebStoreModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage

### Using `LocalStorageService` or `SessionStorageService` service.

```typescript
import { Component } from '@angular/core'
import { LocalStorageService, SessionStorageService } from 'angular-web-store'

@Component({
    selector: 'demo',
    templateUrl: './demo.component.html'
})
export class DemoComponent {

    constructor(
      private local: LocalStorageService, 
      private session: SessionStorageService
    ) { }

    KEY = 'value';
    value: any = null;

    set() {
        this.local.set(this.KEY, { a: 1, now: +new Date }, '4s')
    }

    remove() {
        this.local.remove(this.KEY)
    }

    get() {
        this.value = this.local.get(this.KEY)
    }

    clear() {
        this.local.clear()
    }
}


## License

MIT © [mizne](mailto:w20054319@126.com)
