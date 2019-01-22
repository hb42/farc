/**
 * Start-Component
 */

import {
  Component,
  OnInit,
} from "@angular/core";

import {
  ElectronService,
} from "@hb42/lib-client";

import {
  ConfigService,
} from "./shared";

@Component({
             selector: "farc-root",
             templateUrl: "./app.component.html",
             styleUrls: ["./app.component.css"],
           })
export class AppComponent implements OnInit {

  constructor(public configService: ConfigService,
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
  }

}
