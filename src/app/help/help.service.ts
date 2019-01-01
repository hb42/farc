import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { MainNavService } from "../shared";

@Injectable({
  providedIn: "root"
})
export class HelpService {

  public helpMenu: MenuItem[];
  private readonly hlp: string;

  constructor(private router: Router) {
    this.hlp = "/" + MainNavService.NAV_HELP + "/";
    this.helpMenu = [
      {label: "Datei-Archiv",          routerLink: [this.hlp + MainNavService.NAV_HELP_MAIN]},
      {label: "OE-Übersicht",  icon: "fa fa-list",        routerLink: [this.hlp + MainNavService.NAV_HELP_LIST]},
      {label: "Details",       icon: "fa fa-folder-open", routerLink: [this.hlp + MainNavService.NAV_HELP_TREE]},
      {label: "Vormerkungen",  icon: "fa fa-check",       routerLink: [this.hlp + MainNavService.NAV_HELP_VORM]},
    ];
  }

  public goto(link: string) {
    let target = this.hlp;
    switch (link) {
      case "main":
        target += MainNavService.NAV_HELP_MAIN;
        break;
      case"list":
        target += MainNavService.NAV_HELP_LIST;
        break;
      case "tree":
        target += MainNavService.NAV_HELP_TREE;
        break;
      case "vorm":
        target += MainNavService.NAV_HELP_VORM;
        break;
    }
    this.router.navigate([target]);
  }

}
