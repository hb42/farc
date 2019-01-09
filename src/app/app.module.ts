/**
 * Angular Anwendung konfigurieren
 */

import { HashLocationStrategy, LOCATION_INITIALIZED, LocationStrategy, registerLocaleData, } from "@angular/common";
import { HttpClientModule, } from "@angular/common/http";

import { APP_INITIALIZER, LOCALE_ID, NgModule, } from "@angular/core";
import localeDe from "@angular/common/locales/de";
import { FormsModule, } from "@angular/forms";
import { BrowserModule, } from "@angular/platform-browser";
import { BrowserAnimationsModule, } from "@angular/platform-browser/animations";
import { RouterModule, } from "@angular/router";

import {
  AppConfig,
  //  AuthHttpService,
  //  DefaultAutologinJwtHander,
  ErrorService,
  FileSizePipe,
  LibClientModule,
  LOGON_OPTIONS,
  // LogonInterceptor,
  LogonParameter,
  // LogonService,
} from "@hb42/lib-client";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import {
  AccordionModule,
  BreadcrumbModule,
  ButtonModule,
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  DataTableModule,
  DialogModule,
  DropdownModule, MegaMenuModule,
  MenubarModule,
  MenuModule,
  MessageModule, MessageService,
  MessagesModule,
  OverlayPanelModule,
  PanelModule,
  PickListModule,
  RadioButtonModule,
  SelectButtonModule,
  SharedModule,
  TabMenuModule,
  ToolbarModule,
  TooltipModule,
  TreeModule,
  TreeTableModule,
} from "primeng/primeng";
import {
  ToastModule,
} from "primeng/toast";
import {
  TableModule,
} from "primeng/table";
import {
  AdminGuard,
  AdminService,
  AdminViewComponent,
  ConfigComponent,
  DriveListComponent,
  EpListComponent,
  OeListComponent,
  RolesPipe,
} from "./admin";

import { AppComponent, } from "./app.component";
import { APP_ROUTING, appRoutingProviders, } from "./app.routing";
import { ErrorComponent, PageNotFoundComponent, } from "./error";
import { ListService, ListViewComponent, } from "./list";
import { SelectService, SelectViewComponent, } from "./select";
import { ConfigService, MainHeaderComponent, MainNavService, } from "./shared";
import { StatusComponent, StatusService, } from "./shared/status.component";
import {
  FarcDrivetypePipe,
  FarcTreeComponent,
  FarcTreeService,
  FileListComponent,
  FilesSumPipe,
  TreeViewComponent,
  VormerkPipe,
} from "./tree";
import { HelpComponent, HelplistComponent, HelpmainComponent,
  HelptreeComponent, HelpvormComponent, HelpService } from "./help";

registerLocaleData(localeDe);  // + provider, s.u.

// Damit ConfigService so frueh, wie moeglich geladen wird und der Login vor
// allem anderen kommt.
// (fn , die fn liefert, die ein Promise liefert)
// mit AOT fkt. nur das folgende Konstrukt
export function initConf(configService: ConfigService) {
  return () => configService.init();
}
// TODO  Falls das nochmal mit dem IE11 funktioniert, waere zu testen, ob das
// TODO  nachfolgende Problem immer noch besteht.
// Die injector-Konstruktion ist fuer den IE11 notwendig (Fehler nur im prod mode).
// Alle anderen kommen mit der kuerzeren Variante zurecht.
//      -> https://github.com/angular/angular-cli/issues/5762
//         https://github.com/angular/angular/issues/15501 -> ng 5.0.0-rc8 ?
//
// export function initConf(configService: ConfigService, injector: Injector) {
//   return () => new Promise<any>((resolve: any) => {
//     const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
//     locationInitialized.then(() => {
//       configService.init().then((ver) => resolve(ver));
//     });
//   });
// }

// Die Parameter fuer den Logon werden aus dem AppConfig-Objekt geholt, das beim
// Anwendungsstart die Daten aus einer Konfigurationsdatei holt (-> main.ts).
// Dadurch muessen die Daten mit 'useFactory' geholt werden, 'useValue' wuerde
// hier nnicht funktionieren.
export function logonOptionsFactory(): LogonParameter {
  return {
    logon           : AppConfig.settings.authType,
    appName         : AppConfig.settings.name,
    NTLMserver      : AppConfig.settings.NTLMserver,
    webserviceServer: AppConfig.settings.webserviceServer
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
              // -- angular
              BrowserModule,
              BrowserAnimationsModule,
              FormsModule,
              HttpClientModule,
              RouterModule,

              // -- primeng
              AccordionModule,
              BreadcrumbModule,
              ButtonModule,
              DataTableModule,
              CardModule,
              CheckboxModule,
              ConfirmDialogModule,
              ContextMenuModule,
              DialogModule,
              DropdownModule,
              MegaMenuModule,
              MenubarModule,
              MenuModule,
              MessageModule,
              MessagesModule,
              OverlayPanelModule,
              PanelModule,
              PickListModule,
              RadioButtonModule,
              SelectButtonModule,
              SharedModule,  // w/template etc.
              TableModule,
              TabMenuModule,
              ToastModule,
              ToolbarModule,
              TooltipModule,
              TreeModule,
              TreeTableModule,

              // angular-bootstrp
              NgbModule,

              // -- eigene
              LibClientModule,

              APP_ROUTING,
            ],
            providers   : [
              // -- angular
              { provide: LOCALE_ID, useValue: "de" },  // registerLocaleData() s.o.
              // hashLocation macht weniger Probleme
              {provide: LocationStrategy, useClass: HashLocationStrategy},

              // -- primeng
              ConfirmationService,
              MessageService,

              // -- eigene
              // Konfig fuer Autologon
              {
                provide   : LOGON_OPTIONS,
                useFactory: logonOptionsFactory
              },
              // app startet erst, wenn das Promise aus initConf aufgeloest ist
              // -> login, config holen, usw.
              {
                provide   : APP_INITIALIZER,
                useFactory: initConf,
                deps      : [ConfigService],  // f. IE11-Prob. + Injector
                multi     : true
              },
              ConfigService,
              MainNavService,
              FarcTreeService,
              AdminService,
              StatusService,
              FileSizePipe,
              ListService,
              SelectService,
              HelpService,

              AdminGuard,

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
              ErrorComponent,
              PageNotFoundComponent,
              HelpComponent,
              HelpmainComponent,
              HelplistComponent,
              HelptreeComponent,
              HelpvormComponent,

              // pipes
              FarcDrivetypePipe,
              RolesPipe,
              FilesSumPipe,
              VormerkPipe,

              // start
              AppComponent,

            ],

            bootstrap: [AppComponent],
          })
export class AppModule {
}
