/**
 * Start-Component
 */

import {
  Component,
    // HostBinding,
    Inject,
    OnInit,
} from "@angular/core";
import {
  Http,
  Response,
} from "@angular/http";
import {
  NavigationEnd,
  Router,
} from "@angular/router";

import {
  environment,
} from "../environments/environment";
import {
  keepaliveMinutes,
  keepaliveURL,
  Version,
  VersionService,
} from "../shared/ext";
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

  // fuer die main-component funktioniert "host: {class: "blah blah"}" nicht
  // also hier eintragen, auch wenn die classes fix sind
  // koennte daran liegen, dass <app></app> in der index.html fest eingetragen ist
  // @HostBinding("class.flex-page") protected fp = true;
  // @HostBinding("class.flex-col") protected fc = true;

  constructor(private httphandler: Http, private status: StatusService, private version: VersionService) {
    console.info("Programm gestartet");
    status.info("App Start");
  }

  public ngOnInit(): void {
    console.info("App.ngOnInit start");
    this.startKeepalive();

  }

  private startKeepalive() {
    window.setInterval(
      () => {
        this.httphandler.get(environment.webserviceServer + keepaliveURL)
          .map((response: Response) => response.text())
          .subscribe( (res) => console.info("keepalive " + res),
                      (err) => console.info("keepalive ERROR"));  // session error -> 401 -> httpErrorHandler
      }, 1000 * 60 * keepaliveMinutes );
  }

}
