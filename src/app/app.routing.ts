/**
 * Created by hb on 27.08.16.
 */

import {
    RouterModule,
    Routes,
} from "@angular/router";

import {
  AdminView,
  ConfigComponent,
  DriveList,
  EpListComponent,
  OeList,
} from "./admin";
import {
  ListView,
} from "./list";
import {
  SelectView,
} from "./select";
import {
    TreeView,
} from "./tree";

const appRoutes: Routes = [
  { path: "", redirectTo: "/list", pathMatch: "full" },  // "" muss vorhanden sein!
  { path: "list", component: ListView },
  { path: "tree", component: TreeView },
  { path: "select", component: SelectView },
  { path: "admin", component: AdminView,
    children: [
      { path: "drives", component: DriveList },
      { path: "oes", component: OeList },
      { path: "eps", component: EpListComponent },
      { path: "config", component: ConfigComponent },
    ]},

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
