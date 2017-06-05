/**
 * Created by hb on 27.08.16.
 */

import {
    RouterModule,
    Routes,
} from "@angular/router";

import {
  AdminViewComponent,
  ConfigComponent,
  DriveListComponent,
  EpListComponent,
  OeListComponent,
} from "./admin";
import {
  ListViewComponent,
} from "./list";
import {
  SelectViewComponent,
} from "./select";
import {
    TreeViewComponent,
} from "./tree";

const appRoutes: Routes = [
  { path: "", redirectTo: "/list", pathMatch: "full" },  // "" muss vorhanden sein!
  { path: "list", component: ListViewComponent },
  { path: "tree", component: TreeViewComponent },
  { path: "select", component: SelectViewComponent },
  { path: "admin", component: AdminViewComponent,
    children: [
      { path: "drives", component: DriveListComponent },
      { path: "oes", component: OeListComponent },
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
