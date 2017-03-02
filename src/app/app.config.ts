/**
 * Created by hb on 10.10.16.
 */
import {
    FormsModule,
} from "@angular/forms";
import {
    HttpModule,
} from "@angular/http";
import {
    BrowserModule,
} from "@angular/platform-browser";
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
} from "./services";
import {
    FarcTree,
    FarcTreeService,
    FileList,
    TreeView,
} from "./tree";

import {
    LibngModule,
} from "@hb42/lib-client";
import {
  FarcDrivetypePipe,
} from "@hb42/lib-farc";

export const APP_IMPORTS = [
  // angular
  BrowserModule,
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

  // eigene
  LibngModule,

];

export const APP_PROVIDERS = [
    // primeng
  ConfirmationService,

    // eigene
  ConfigService,
  FarcTreeService,
  AdminService,

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

];

export const APP_PIPES = [
  FarcDrivetypePipe,
  RolesPipe,

];
