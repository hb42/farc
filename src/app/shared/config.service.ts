/**
 * Created by hb on 06.02.17.
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
  UserData,
  UserSession,
} from ".";
import {
  environment,
} from "../../environments/environment";
import {
  confUSER,
} from "../../shared/ext";

@Injectable()
export class ConfigService {

  private restServer: string;
  private userSession: Promise<UserSession>;
  private userData: UserData;
  private userDataChange: EventEmitter<UserData> = new EventEmitter();

  constructor(private httphandler: Http) {
    console.info("c'tor ConfigService");
    this.restServer = environment.webserviceServer + environment.webservicePath;

    // in den Event fuer Benutzer-Config-Aernderungen einklinken
    this.userDataChange.subscribe( () => {
      this.saveUserConfig();
    });
    // Benutzer-Config aus der DB holen
    this.fetchUserConfig();
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

  /**
   * liefert { isadmin: boolean }
   *
   * @returns {Observable<any>}
   */
  public isAdmin(): Observable<any> {
    return this.httphandler.get(this.restServer + "/isadmin")
      .map( (response: Response) => response.json() );
  }

  /**
   * Benutzer-Config
   *
   * @returns {Promise<UserSession>}
   */
  public getUserConfig(): Promise<UserSession> {
    return this.userSession;
  }

  /**
   * Benutzer_Config sichern
   *
   * Wird per Event bei Aenderung in UserSession ausgeloest.
   */
  private saveUserConfig() {
    this.saveConfig(confUSER, this.userData)
      .subscribe((rc) => {
        console.info("user conf saved");
        console.dir(rc);
      });
  }

  /**
   * Benutzer-Config aus der DB holen
   *
   * Wird als Promise abgelegt, um race conditions beim App-Start
   * zu vermeiden.
   */
  private fetchUserConfig() {
    console.info("fetchUserConfig");
    if (!this.userSession) {
      console.info("get from db");
      this.userSession = this.getConfig(confUSER).toPromise().then( (con) => {
        this.userData = con;
        if (this.userData === null) {
          this.userData = { treepath: [] };
        }
        return new UserSession(this.userDataChange, this.userData);
      });
    }
  }

  // private getPackageJson() {
  //   return this.httphandler.get("/package.json")
  //     .map( (response: Response) => response.json() );
  // }
  // private setPackageData() {
  //   return this.getPackageJson().toPromise().then( (pack) => {
  //     // package.json aufbereiten
  //     return pack;
  //
  //   });
  // }

}
