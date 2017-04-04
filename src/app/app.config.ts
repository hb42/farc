/**
 * Created by hb on 10.10.16.
 */
import {
  HashLocationStrategy,
  LocationStrategy,
} from "@angular/common";
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

import {
    FileSizePipe,
    HttpErrorHandler,
    LibngModule,
} from "@hb42/lib-client";
import {
  FarcDrivetypePipe,
} from "@hb42/lib-farc";

export const APP_IMPORTS = [
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

];

export const APP_PROVIDERS = [
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

];

export const APP_DECLARATIONS = [
  ListView,
  TreeView,
  FarcTree,
  FileList,
  SelectView,
  AdminView,
  DriveList,
  OeList,
  StatusComponent,

];

export const APP_PIPES = [
  FarcDrivetypePipe,
  RolesPipe,

];
