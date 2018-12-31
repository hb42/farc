/**
 * Created by hb on 17.01.17.
 */

import { HttpClient } from "@angular/common/http";
import { Injectable, } from "@angular/core";
import { MenuItem } from "primeng/api";
import { Observable, } from "rxjs";

import { AppConfig } from "@hb42/lib-client";
import { FarcDrive, FarcDriveDocument, FarcEndpunktDocument, FarcOe, FarcOeDocument, } from "@hb42/lib-farc";

import { ConfigService, MainNavService, StatusService, } from "../shared";

@Injectable()
export class AdminService {

  public adminMenu: MenuItem[];
  private readonly restServer: string;

  constructor(private httphandler: HttpClient, private statusService: StatusService,
              private configService: ConfigService) {
    console.debug("c'tor AdminService");
    this.restServer = AppConfig.settings.webserviceServer + AppConfig.settings.webservicePath;

    const adm = "/" + MainNavService.NAV_ADMI + "/";
    this.adminMenu = [
      {label: "Laufwerke",              icon: "fa fa-hdd-o",         routerLink: [adm + MainNavService.NAV_ADM_DRV]},
      {label: "Organisationseinheiten", icon: "fa fa-list",          routerLink: [adm + MainNavService.NAV_ADM_OES]},
      {label: "Endpunkte",              icon: "fa fa-folder-open-o", routerLink: [adm + MainNavService.NAV_ADM_EPS]},
      {label: "Konfiguration",          icon: "fa fa-gears",         routerLink: [adm + MainNavService.NAV_ADM_CFG]},
    ];

  }

  public test() {
    this.httphandler.get(this.restServer + "/test")
      .subscribe(
      (res) => {
        console.dir(res);
      },
      (err) => {
        console.error("error calling /test " + err);
      },
    );
  }

  public getDrives(): Observable<FarcDriveDocument[]> {
    // this.statusService.success("AdminService getDrives()");
    return this.httphandler.get<FarcDriveDocument[]>(this.restServer + "/drives");
  }

  public setDrive(drv: FarcDrive) {
    return this.httphandler.post(this.restServer + "/drives", drv);
  }

  public deleteDrive(drv: FarcDriveDocument) {
    return this.httphandler.request("delete", this.restServer + "/drives", {body: drv});
    // .map( (response: Response) => response.json() );
  }

  public getOEs(): Observable<FarcOeDocument[]> {
    return this.httphandler.get<FarcOeDocument[]>(this.restServer + "/oes");
  }

  public setOE(oe: FarcOe) {
    return this.httphandler.post(this.restServer + "/oes", oe);
    // .map((response: Response) => response.json() );
  }

  public deleteOE(oe: FarcOeDocument) {
    return this.httphandler.request("delete", this.restServer + "/oes", {body: oe});
      // .pipe(map((response: Response) => response.json()));
  }

  public getEps(): Observable<FarcEndpunktDocument[]> {
    return this.httphandler.get<FarcEndpunktDocument[]>(this.restServer + "/eps");
  }

  public setEp(ep: FarcEndpunktDocument, newoe): Observable<any> {
    return this.httphandler.post(this.restServer + "/eps", {endpunkt: ep, oe: newoe});
    // .map((response: Response) => response.json() );
  }

  public execReadAll() {
    this.httphandler.get(this.restServer + "/readall")
      .subscribe(
        (res) => {
          this.statusService.info(res.toString());
        }, (err) => {
          this.statusService.error("Fehler: Einlesen konnte nicht gestartet werden.");
          console.error("error calling /readall ");
          console.dir(err);
        }
      );
  }

  public execVormerkAll() {
    this.httphandler.get(this.restServer + "/readvorm")
      .subscribe(
        (res) => {
          this.statusService.info(res.toString());
        }, (err) => {
          this.statusService.error("Fehler: Vormerkungen konnten nicht gestartet werden.");
          console.error("error calling /readvorm ");
          console.dir(err);
        }
      );
  }

}
