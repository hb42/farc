import { Injectable } from "@angular/core";
import { NavigationEnd, Router, } from "@angular/router";
import { MenuItem } from "primeng/api";
import {filter } from "rxjs/operators";

import { ConfigService, } from "./config.service";
import { UserSession, } from "./user-session";

@Injectable()
export class MainNavService {

  public static NAV_LIST = "list";
  public static NAV_TREE = "tree";
  public static NAV_VORM = "select";
  public static NAV_ADMI = "admin";
  public static NAV_ERROR = "error";

  public static NAV_ADM_DRV = "drives";
  public static NAV_ADM_OES = "oes";
  public static NAV_ADM_EPS = "eps";
  public static NAV_ADM_CFG = "config";

  public mainMenu: MenuItem[];

  private usersession: UserSession;

  constructor(private router: Router, private configService: ConfigService) {
    console.debug("MainNavService c'tor");
    this.usersession = this.configService.getUserConfig();

    this.mainMenu = [
      {label: "OE-Übersicht", icon: "fa fa-list",         routerLink: ["/" + MainNavService.NAV_LIST]},
      {label: "Details",      icon: "fa fa-folder-open",  routerLink: ["/" + MainNavService.NAV_TREE]},
      {label: "Vormerkungen", icon: "fa fa-check",        routerLink: ["/" + MainNavService.NAV_VORM]},
      {label: "Admin",        icon: "fa fa-gears",        routerLink: ["/" + MainNavService.NAV_ADMI],
        visible: this.usersession.isAdmin()},
    ];

    // // main tab/ admin tab
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd))
      .subscribe((evt: NavigationEnd) => {
        const last: string = evt.urlAfterRedirects;
        if (last && !last.endsWith(MainNavService.NAV_ERROR)) {
          this.usersession.nav = evt.urlAfterRedirects;
        }
      });

    // zur letzten Seite des Users
    let goto = this.usersession.nav;
    if (goto && goto.endsWith(MainNavService.NAV_ERROR)) {
      goto = "";
    }
    this.router.navigate([goto])
      .then((nav) => {
        if (!nav) {  // canActivate liefert false, also zur Startseite
          this.goto("");
          // this.router.navigate(["/"]);
        }
      })
      .catch((err) => console.debug("user navigation error " + err));
  }

  public goto(targ: string) {
    this.router.navigate(["/" + targ]);
  }

}
