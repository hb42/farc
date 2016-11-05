/**
 * Created by hb on 27.08.16.
 */

import {
    RouterModule,
    Routes,
} from "@angular/router";

// import {
//   AppComponent,
// } from "./";
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
    TreeView,
} from "./tree";

const appRoutes: Routes = [
  { path: "", redirectTo: "/list", pathMatch: "full" },  // "" muss vorhanden sein!
  { path: "list", component: ListView },
  { path: "tree", component: TreeView },
  { path: "select", component: SelectView },
  { path: "admin", component: AdminView },

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
