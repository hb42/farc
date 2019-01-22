import { Component, OnInit, } from "@angular/core";

import { ErrorService, Version, VersionService, } from "@hb42/lib-client";

import { ConfigService, } from "../config.service"
import { MainNavService} from "../main-nav.service";

@Component({
             selector   : "farc-main-header",
             templateUrl: "./main-header.component.html",
             styleUrls  : ["./main-header.component.css"],
           })
export class MainHeaderComponent implements OnInit {

  public cliVer: Version;
  public srvVer: Version;
  public subVer: string[];
  public ueber = false;
  public whatsnew = false;
  public changelog = false;

  constructor(public version: VersionService,
              public configService: ConfigService,
              public mainNavService: MainNavService,
              public errorService: ErrorService) {
  }

  public ngOnInit() {
    this.cliVer = this.version.ver;
    this.srvVer = this.version.serverVer;
    this.subVer = [...this.cliVer.versions,
                   this.srvVer.displayname + " " + this.srvVer.version, ...this.srvVer.versions];

    if (this.configService.checkWhatsNew()) {
      this.showWhatsNew();
    }
  }

  public isAdmin(): boolean {
    return this.configService.getUserConfig().isAdmin();
  }

  public showVersion() {
    this.ueber = true;
    this.whatsnew = false;
    this.changelog = false;
  }

  public showWhatsNew() {
    this.whatsnew = true;
    this.ueber = false;
    this.changelog = false;
  }

  public showChangelog() {
    this.changelog = true;
    this.whatsnew = false;
    this.ueber = false;
  }

}
