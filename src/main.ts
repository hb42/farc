/*
 * Anwendugnsstart
 *
 * Konfig holen und Angular-App starten
 */


import {
  enableProdMode,
} from "@angular/core";
import {
  platformBrowserDynamic,
} from "@angular/platform-browser-dynamic";

import {
  AppConfig
} from "@hb42/lib-client"

import {
  AppModule,
} from "./app";
import {
  environment,
} from "./environments/environment";

enableProdMode();

// config holen und Angular-App starten
AppConfig.load(environment.configFile).then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch((err) => {
      console.info("Runtime-ERROR " + err);
    })
});
