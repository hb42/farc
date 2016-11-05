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
    DataTableModule,
    SharedModule,
    ToolbarModule,
    TreeModule,
} from "primeng/primeng";

import {
    AdminView,
} from "./admin";
import {
    ListView,
} from "./list";
import {
    SelectView,
} from "./select";
import {
    FarcTree,
    FarcTreeService,
    FileList,
    TreeView,
} from "./tree";

import {
    LibngModule,
} from "@hb42/lib-client";

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

  // eigene
  LibngModule,

];

export const APP_PROVIDERS = [
  FarcTreeService,

];

export const APP_DECLARATIONS = [
  ListView,
  TreeView,
  FarcTree,
  FileList,
  SelectView,
  AdminView,

];

export const APP_PIPES = [

];
