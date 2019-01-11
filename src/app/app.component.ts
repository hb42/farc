/**
 * Start-Component
 */

import {
  Component,
  OnInit,
} from "@angular/core";

import {
  ElectronService,
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

  constructor(public configService: ConfigService,
              private status: StatusService,
              public version: VersionService,
              public electronService: ElectronService) {
    console.debug("c'tor AppComponent");
  }

  public ngOnInit(): void {
    console.debug("App.ngOnInit start");
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send("app-ready", "");
    } else {
      document.location!.reload(true);
    }
    this.status.info(this.version.ver.displayname + " " + this.version.ver.version + " gestartet");
  }

}
