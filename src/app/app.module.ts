/**
 * Angular Anwendung starten
 */
import {
    enableProdMode,
    NgModule,
} from "@angular/core";
// import {
//   XHRBackend,
// } from "@angular/http";

import {
  APP_DECLARATIONS,
  APP_IMPORTS,
  APP_PIPES,
  APP_PROVIDERS,
  APP_ROUTING,
  AppComponent,
  appRoutingProviders,
} from "./";

// import {
//     HttpErrorHandler,
// } from "@hb42/lib-client";

/**
 * app style sheets
 */
import "../css/styles.css";

/**
 * Angular-Hauptmodul initialisieren
 *
 * @param metadata - Webpack-Config
 * @param conf - extern geladene AppConfig
 * @param sessiondata - User-Config aus DB
 *
 *
 * Exception beim Start: Uncaught Error: Can't resolve all parameters for ...
 *
 * Service kann evtl. nicht aufgeloest werden: muss in index.ts am Anfang stehen,
 * bzw. direkt importieren.
 * -> http://stackoverflow.com/questions/37997824/angular-2-di-error-exception-cant-resolve-all-parameters
 *
 */
export function createAppModule(metadata: Object, conf: Object, sessiondata: Object) {

  @NgModule({
              imports: [
                  ...APP_IMPORTS, // imports etc. aus app.config.ts
                  APP_ROUTING,
              ],
              providers: [
                  ...APP_PROVIDERS,
                  appRoutingProviders,

                  // TODO das Initialisieren von HttpErrorHandler funktioniert nicht
                  //      Vermutlich hat sich in Angular etwas geaendert. Mal ansehen, ob das der
                  //      richtige Weg fuer's Errorhandling ist.
                  // { provide: XHRBackend, useClass: HttpErrorHandler },

                    // -> @Inject('METADATA') private metadata: any
                  { provide: "METADATA", useValue: metadata },
                  { provide: "CONFIG", useValue: conf },
                  // TODO  logon handling in farc-server ueberarbeiten:
                  // TODO  sessiondata nicht beim User speichern, damit wird das auch nicht beim Logon gebraucht
                  // TODO  besser via ConfigService => ggf. abstrahieren in lib-client
                  // { provide: "SESSION", useValue: sessiondata },
              ],
              declarations: [
                  ...APP_DECLARATIONS,
                  ...APP_PIPES,
                AppComponent,

              ],
              bootstrap: [AppComponent],
            })
  class AppModule { }

  if ("production" === process.env.ENV) {
    enableProdMode();
  }

  return AppModule;
}
