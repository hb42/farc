/**
 * Created by hb on 03.10.16.
 */

import {
    Component,
    OnInit,
} from "@angular/core";
import {
  NavigationEnd,
  Router,
} from "@angular/router";

@Component({
             selector: "farc-admin-view",
             host: {
               class: "flex-panel flex-content-fix",
             },
             templateUrl: "./adminview.component.html",
             styleUrls: ["./adminview.component.css"],
           })
export class AdminView implements OnInit {

  protected activetab: string;

  protected leftPaneWidth: string;
  protected leftPaneMinWidth: string;
  protected centerPaneWidth: string;
  protected centerPaneMinWidth: string;

  constructor(private router: Router) {
    console.info("c'tor Admin");
  }

  public ngOnInit(): void {
    this.leftPaneWidth = "200px";
    this.leftPaneMinWidth = "200px";
    this.centerPaneWidth = "100%";
    this.centerPaneMinWidth = "100px";

    // tab
    this.router.events
      .filter( (event) => event instanceof NavigationEnd)
      .subscribe( (evt: NavigationEnd) => {
        // path -> /a/b => split -> "", "a","b"
        const addr: string[] = evt.urlAfterRedirects.split("/");
        if (addr.length > 2 && addr[1] === "admin") {
          this.activetab = addr[2];
        }
      });

  }

  protected tabclick(tab: string) {
    this.activetab = tab;
    this.router.navigate(["/admin/" + tab]);
  }

}
