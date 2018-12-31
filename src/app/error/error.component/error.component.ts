import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, } from "@angular/router";

import { ErrorService, } from "@hb42/lib-client";
// import "rxjs/operators/switchMap";
import { ConfigService, UserSession } from "../../shared";

@Component({
             selector   : "farc-error",
             templateUrl: "./error.component.html",
             styleUrls  : ["./error.component.css"]
           })
export class ErrorComponent implements OnInit {
  public status: string;
  public message: string;

  constructor(private route: ActivatedRoute,
              public errorService: ErrorService,
              private configService: ConfigService) {
    console.debug("ErrorComponent c'tor");
  }

  ngOnInit() {
    console.debug("ErrorComponent ngOnInit");
    const latest = this.errorService.getLastError();
    this.status = latest["title"];
    this.message = latest["message"];
    console.debug("Error:");
    console.dir(latest);
    // this.status = this.route.snapshot.paramMap.get("status");
    // this.message = this.route.snapshot.paramMap.get("msg");
  }

  /**
   * Bevor die App zurueckgesetzt wird, noch den Pfad, der fuer den User
   * gespeichert ist auf default setzen (sonst dreht sich ein 404 im Kreis).
   */
  public restartApp() {
    const usersession: UserSession = this.configService.getUserConfig();
    usersession.nav = "/";
    this.errorService.resetApp()
  }

}
