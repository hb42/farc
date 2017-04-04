/**
 * Created by hb on 06.02.17.
 */

import {
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
  confUSER,
  FarcSession,
} from "@hb42/lib-farc";

import {
  environment,
} from "../../environments";

// TODO confUSER raus - es wird EIN objekt gespeichert, geholt/ User aus http-session -> state
// TODO + /config fehlt noch auf Serverseite
@Injectable()
export class ConfigService {

  private restServer: string;
  private userSession: FarcSession;

  constructor(private httphandler: Http) {
    console.info("c'tor ConfigService");
    this.restServer = environment.webserviceServer + environment.webservicePath;

    this.getConfig(confUSER).subscribe(
        (res) => {
          if (res) {
            this.userSession = res;
          } else {
            this.userSession = {};
          }
        },
        (err) => {
           this.userSession = {};
        },
    );

  }

  public getConfig(confName: string): Observable<any> {
    return this.httphandler.get(this.restServer + "/config/" + confName)
        .map((response: Response) => response.json());
  }

  public saveConfig(confName: string, value: any) {
    return this.httphandler.post(this.restServer + "/config/" + confName, value)
        .map((response: Response) => response.json() );
  }

  public deleteConfig(confName: string) {
    return this.httphandler.delete(this.restServer + "/config/" + confName)
        .map( (response: Response) => response.json() );
  }

  public getUserConfig(): FarcSession {
    return this.userSession;
  }
  public saveUserConfig() {
    this.saveConfig(confUSER, this.userSession);
  }

}
