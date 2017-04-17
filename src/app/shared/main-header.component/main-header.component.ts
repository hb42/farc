import {
  Component,
  OnInit,
} from "@angular/core";
import {
  NavigationEnd,
  Router,
} from "@angular/router";

import {
  Version,
  VersionService,
} from "../../../shared/ext";
import {
  ConfigService,
  StatusService,
} from "../../shared";

@Component({
  selector: "farc-main-header",
  templateUrl: "./main-header.component.html",
  styleUrls: ["./main-header.component.css"],
})
export class MainHeaderComponent implements OnInit {

  protected activetab: string;
  protected ver: Version;
  protected isAdmin: boolean = false;

  constructor(private router: Router, private statusService: StatusService,
              private configService: ConfigService, private version: VersionService) {
    this.activetab = "list";
  }

  public ngOnInit() {
    this.configService.isAdmin().subscribe( (res) => {
      this.isAdmin = res.isadmin;
    });
    this.ver = this.version.ver;

    // tab
    this.router.events
      .filter( (event) => event instanceof NavigationEnd)
      .subscribe( (evt: NavigationEnd) => {
        // path -> /a/b => split -> "", "a","b"
        const addr: string[] = evt.urlAfterRedirects.split("/");
        if (addr.length > 1) {
          this.activetab = addr[1];
        }
      });

  }

  protected tabclick(tab: string) {
    this.activetab = tab;
    this.router.navigate(["/" + tab]);
  }

}
