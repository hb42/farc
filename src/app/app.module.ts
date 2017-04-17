/**
 * Angular Anwendung starten
 */

import {
  HashLocationStrategy,
  LocationStrategy,
} from "@angular/common";
import {
  APP_INITIALIZER,
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
} from "primeng/primeng";

import {
  FileSizePipe,
  LibClientModule,
  VersionService,
  XHRBackendHandler,
} from "../shared/ext";
import {
  APP_ROUTING,
  AppComponent,
  appRoutingProviders,
} from "./";
import {
  AdminService,
  AdminView,
  ConfigComponent,
  DriveList,
  EpListComponent,
  OeList,
  RolesPipe,
} from "./admin";
import {
  ListView,
} from "./list";
import {
  SelectView,
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
  FarcTree,
  FarcTreeService,
  FileList,
  TreeView,
} from "./tree";

// Damit ConfigService so frueh, wie moeglich geladen wird
// (fn , die fn liefert, die ein Promise liefert)
export function initConf(configService: ConfigService) {
  return () => () => {
    return new Promise<ConfigService>( (resolve) => {
      resolve(configService);
    });
  };
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
              // angular
              BrowserModule,
              BrowserAnimationsModule,
              FormsModule,
              HttpModule,
              RouterModule,

              // primeng
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

              // eigene
              LibClientModule,

              APP_ROUTING,
            ],
            providers   : [
              // angular
              // hashLoc macht weniger Probleme
              { provide: LocationStrategy, useClass: HashLocationStrategy },
              // error handling f. ajax calls
              { provide: XHRBackend, useClass: XHRBackendHandler },

              // primeng
              ConfirmationService,

              // eigene
              ConfigService,
              FarcTreeService,
              AdminService,
              StatusService,

              //   // -> @Inject('METADATA') private metadata: any
              // { provide: "METADATA", useFactory() { return WEBPACK_DATA.metadata; } },
              { provide: APP_INITIALIZER,
                useFactory: initConf,
                deps: [ConfigService], multi: true },

              ...appRoutingProviders,
            ],
            declarations: [
              // components
              MainHeaderComponent,
              ListView,
              TreeView,
              FarcTree,
              FileList,
              SelectView,
              AdminView,
              DriveList,
              OeList,
              EpListComponent,
              ConfigComponent,
              StatusComponent,

              // pipes
              FarcDrivetypePipe,
              RolesPipe,

              // start
              AppComponent,

            ],

            bootstrap   : [AppComponent],
          })
export class AppModule { }
