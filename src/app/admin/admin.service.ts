/**
 * Created by hb on 17.01.17.
 */

import {
  EventEmitter,
  Inject,
  Injectable,
} from "@angular/core";
import {
  Http,
  Response,
} from "@angular/http";
import {
  Observable,
} from "rxjs";

import {
  FarcDrive,
  FarcDriveDocument,
  FarcEntryTypes,
  FarcOe,
  FarcOeDocument,
  FarcSession,
  FarcTreeNode,
} from "@hb42/lib-farc";

import {
  saveSessionURL,
} from "@hb42/lib-common";

@Injectable()
export class AdminService {

  private restServer: string;

  constructor(private httphandler: Http, @Inject("CONFIG") private conf: any) {
    console.info("c'tor AdminService");
    this.restServer = conf.webserviceServer + conf.webservicePath;

  }

  public getDrives(): Observable<FarcDriveDocument[]> {
    return this.httphandler.get(this.restServer + "/drives")
        .map((response: Response) => response.json() );
  }

  public setDrive(drv: FarcDrive) {
    return this.httphandler.post(this.restServer + "/drives", drv)
        .map((response: Response) => response.json() );
  }

  public deleteDrive(drv: FarcDriveDocument) {
    return this.httphandler.delete(this.restServer + "/drives", {body: drv})
        .map( (response: Response) => response.json() );
  }

  public getOEs(): Observable<FarcOeDocument[]> {
    return this.httphandler.get(this.restServer + "/oes")
        .map((response: Response) => response.json() );
  }

  public setOE(oe: FarcOe) {
    return this.httphandler.post(this.restServer + "/oes", oe)
        .map((response: Response) => response.json() );
  }

  public deleteOE(oe: FarcOeDocument) {
    return this.httphandler.delete(this.restServer + "/oes", {body: oe})
        .map( (response: Response) => response.json() );
  }

}
