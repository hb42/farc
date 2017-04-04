/**
 * Angular Anwendung starten
 */

import {
  HashLocationStrategy,
  LocationStrategy,
} from "@angular/common";
import {
  NgModule,
} from "@angular/core";
import {
  FormsModule,
} from "@angular/forms";
import {
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
  HttpErrorHandler,
  LibngModule,
} from "@hb42/lib-client";
import {
  FarcDrivetypePipe,
} from "@hb42/lib-farc";

import {
  APP_ROUTING,
  AppComponent,
  appRoutingProviders,
} from "./";
import {
  AdminService,
  AdminView,
  DriveList,
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
} from "./shared";
import {
  StatusComponent,
  StatusService,
} from "./shared/status";
import {
  FarcTree,
  FarcTreeService,
  FileList,
  TreeView,
} from "./tree";

/**
 * app style sheets
 */
import "../css/styles.css";

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
              LibngModule,

              APP_ROUTING,
            ],
            providers   : [
              // angular
              // hashLoc macht weniger Probleme
              { provide: LocationStrategy, useClass: HashLocationStrategy },
              // error handling f. ajax calls
              { provide: XHRBackend, useClass: HttpErrorHandler },

              // primeng
              ConfirmationService,

              // eigene
              ConfigService,
              FarcTreeService,
              AdminService,
              StatusService,

              ...appRoutingProviders,
              //   // -> @Inject('METADATA') private metadata: any
              // { provide: "METADATA", useFactory() { return WEBPACK_DATA.metadata; } },
            ],
            declarations: [
              // components
              ListView,
              TreeView,
              FarcTree,
              FileList,
              SelectView,
              AdminView,
              DriveList,
              OeList,
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
