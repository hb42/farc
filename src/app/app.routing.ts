/**
 * Created by hb on 27.08.16.
 */

import {
    RouterModule,
    Routes,
} from "@angular/router";

import {
  AdminGuard,
  AdminViewComponent,
  ConfigComponent,
  DriveListComponent,
  EpListComponent,
  OeListComponent,
} from "./admin";
import {
  ErrorComponent,
  PageNotFoundComponent,
} from "./error";
import { HelpComponent, HelplistComponent, HelpmainComponent, HelptreeComponent, HelpvormComponent } from "./help";
import {
  ListViewComponent,
} from "./list";
import {
  SelectViewComponent,
} from "./select";
import {
    TreeViewComponent,
} from "./tree";
import {
  MainNavService,
} from "./shared";

const appRoutes: Routes = [
  { path: "", redirectTo: "/" + MainNavService.NAV_LIST, pathMatch: "full" },  // "" muss vorhanden sein!
  { path: MainNavService.NAV_LIST, component: ListViewComponent },
  { path: MainNavService.NAV_TREE, component: TreeViewComponent },
  { path: MainNavService.NAV_VORM, component: SelectViewComponent },
  { path: MainNavService.NAV_ADMI, component: AdminViewComponent,
    canActivate: [ AdminGuard ],
    children: [
      { path: MainNavService.NAV_ADM_DRV, component: DriveListComponent, canActivate: [ AdminGuard ] },
      { path: MainNavService.NAV_ADM_OES, component: OeListComponent,    canActivate: [ AdminGuard ] },
      { path: MainNavService.NAV_ADM_EPS, component: EpListComponent,    canActivate: [ AdminGuard ] },
      { path: MainNavService.NAV_ADM_CFG, component: ConfigComponent,    canActivate: [ AdminGuard ] },
    ]},
  { path: MainNavService.NAV_HELP, component: HelpComponent,
    children: [
      { path: "", component: HelpmainComponent},
      { path: MainNavService.NAV_HELP_MAIN, component: HelpmainComponent},
      { path: MainNavService.NAV_HELP_LIST, component: HelplistComponent},
      { path: MainNavService.NAV_HELP_TREE, component: HelptreeComponent},
      { path: MainNavService.NAV_HELP_VORM, component: HelpvormComponent},
    ]},
  { path: MainNavService.NAV_ERROR, component: ErrorComponent },
  // { path: "error/:status/:msg", component: ErrorComponent },

  { path: "**", component: PageNotFoundComponent },
  // {
  //   path: 'heroes',
  //   component: HeroListComponent,
  //   data: {
  //     title: 'Heroes List'
  //   }
  // },
  // { path: 'hero/:id', component: HeroDetailComponent },
  // { path: '**', component: PageNotFoundComponent }
];

export const appRoutingProviders: any[] = [

];

export const APP_ROUTING = RouterModule.forRoot(appRoutes);
