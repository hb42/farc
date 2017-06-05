/*
 * Anwendugnsstart
 *
 * Konfig holen, Benutzer anmelden und Angular-App starten
 */


import {
  enableProdMode,
} from "@angular/core";
import {
  platformBrowserDynamic,
} from "@angular/platform-browser-dynamic";

import {
  AppModule,
} from "./app";
import {
  environment,
} from "./environments/environment";

// primeng 4.0.0-rc.3: virtaul scrolling in datatable fkt. nur im prodMode
// if (environment.production) {
  enableProdMode();
// }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch( (err) => {
    console.info("Runtime-ERROR " + err);
});
