/**
 * Angular Anwendung konfigurieren
 */

import {
  HashLocationStrategy,
  LOCATION_INITIALIZED,
  LocationStrategy,
} from "@angular/common";
import {
  APP_INITIALIZER,
  Injector,
  NgModule,
} from "@angular/core";
import {
  FormsModule,
} from "@angular/forms";
import {
  Http,
  HttpModule,
  XHRBackend,
} from "@angular/http";
import {
  BrowserModule,
} from "@angular/platform-browser";
import {
  BrowserAnimationsModule,
} from "@angular/platform-browser/animations";
import {
  RouterModule,
} from "@angular/router";
import {
  BreadcrumbModule,
  ButtonModule,
  ConfirmationService,
  ConfirmDialogModule,
  DataTableModule,
  DialogModule,
  DropdownModule,
  MenuModule,
  OverlayPanelModule,
  PickListModule,
  SharedModule,
  ToolbarModule,
  TreeModule,
  TreeTableModule,
} from "primeng/primeng";

import {
  FileSizePipe,
  LibClientModule,
  XHRBackendHandler,
} from "../shared/ext";
import {
  APP_ROUTING,
  AppComponent,
  appRoutingProviders,
} from "./";
import {
  AdminService,
  AdminViewComponent,
  ConfigComponent,
  DriveListComponent,
  EpListComponent,
  OeListComponent,
  RolesPipe,
} from "./admin";
import {
  ListViewComponent,
} from "./list";
import {
  SelectViewComponent,
} from "./select";
import {
  ConfigService,
  MainHeaderComponent,
} from "./shared";
import {
  StatusComponent,
  StatusService,
} from "./shared/status";
import {
  FarcDrivetypePipe,
  FarcTreeComponent,
  FarcTreeService,
  FileListComponent,
  FilesSumPipe,
  TreeViewComponent,
  VormerkPipe,
} from "./tree";

// Damit ConfigService so frueh, wie moeglich geladen wird und der Login vor
// allem anderen kommt.
// (fn , die fn liefert, die ein Promise liefert)
// mit AOT fkt. nur das folgende Konstrukt
// (so nicht: export const initConf = (cf: ConfigService) => () => cf.init();)
// export function initConf(configService: ConfigService) {
//   return () => configService.init();
// }

// Die injector-Konstruktion ist fuer den IE11 notwendig (Fehler nur im prod mode).
// Alle anderen kommen mit auskommentierten kuerzeren Variante zurecht.
// TODO -> https://github.com/angular/angular-cli/issues/5762
//
export function initConf(configService: ConfigService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      configService.init().then((ver) => resolve(ver));
    });
  });
}

/**
 * Angular-Hauptmodul
 *
 * Exception beim Start: Uncaught Error: Can't resolve all parameters for ...
 *
 * Service kann evtl. nicht aufgeloest werden: muss in index.ts am Anfang stehen,
 * bzw. direkt importieren.
 * -> http://stackoverflow.com/questions/37997824/angular-2-di-error-exception-cant-resolve-all-parameters
 *
 */

@NgModule({
            imports     : [
              // -- angular
              BrowserModule,
              BrowserAnimationsModule,
              FormsModule,
              HttpModule,
              RouterModule,

              // -- primeng
              SharedModule,  // w/template etc.
              ToolbarModule,
              TreeModule,
              BreadcrumbModule,
              ButtonModule,
              DataTableModule,
              DialogModule,
              DropdownModule,
              MenuModule,
              ConfirmDialogModule,
              PickListModule,
              OverlayPanelModule,
              TreeTableModule,

              // -- eigene
              LibClientModule,

              APP_ROUTING,
            ],
            providers   : [
              // -- angular
              // hashLoc macht weniger Probleme
              { provide: LocationStrategy, useClass: HashLocationStrategy },

              // -- primeng
              ConfirmationService,

              // -- eigene
              // error handling f. ajax calls
              { provide: XHRBackend, useClass: XHRBackendHandler },
              // app startet erst, wenn das Promise aus initConf aufgeloest ist
              // -> login, config holen, usw.
              { provide: APP_INITIALIZER,
                useFactory: initConf,
                deps: [ConfigService, Injector],
                multi: true },
              ConfigService,
              FarcTreeService,
              AdminService,
              StatusService,
              FileSizePipe,

              //   // -> @Inject('METADATA') private metadata: any
              // { provide: "METADATA", useFactory() { return WEBPACK_DATA.metadata; } },

              ...appRoutingProviders,
            ],
            declarations: [
              // components
              MainHeaderComponent,
              ListViewComponent,
              TreeViewComponent,
              FarcTreeComponent,
              FileListComponent,
              SelectViewComponent,
              AdminViewComponent,
              DriveListComponent,
              OeListComponent,
              EpListComponent,
              ConfigComponent,
              StatusComponent,

              // pipes
              FarcDrivetypePipe,
              RolesPipe,
              FilesSumPipe,
              VormerkPipe,

              // start
              AppComponent,

            ],

            bootstrap   : [AppComponent],
          })
export class AppModule { }
