/**
 * Start-Component
 */

import {
  Component,
  OnInit,
} from "@angular/core";

import {
  VersionService,
} from "@hb42/lib-client";

import {
  ConfigService,
  StatusService,
} from "./shared";

@Component({
             selector: "farc-root",
             templateUrl: "./app.component.html",
             styleUrls: ["./app.component.css"],
           })
export class AppComponent implements OnInit {

  constructor(public configService: ConfigService, private status: StatusService, public version: VersionService) {
    console.debug("c'tor AppComponent");
  }

  public ngOnInit(): void {
    console.debug("App.ngOnInit start");
    this.status.info(this.version.ver.displayname + " " + this.version.ver.version + " gestartet");
  }

}
