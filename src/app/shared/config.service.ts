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
} from "rxjs/Observable";

import {
  UserData,
  UserSession,
} from ".";
import {
  environment,
} from "../../environments/environment";
import {
  confUSER,
  loginURL,
  Version,
  VersionService,
} from "../../shared/ext";

@Injectable()
export class ConfigService {

  private restServer: string;
  private userSession: UserSession;
  private userData: UserData;
  private userDataChange: EventEmitter<UserData> = new EventEmitter();

  constructor(private httphandler: Http, private version: VersionService) {
    console.debug("c'tor ConfigService");
    this.restServer = environment.webserviceServer + environment.webservicePath;

    // in den Event fuer Benutzer-Config-Aernderungen einklinken
    this.userDataChange.subscribe( () => {
      this.saveUserConfig();
    });
  }

  /**
   * User login + fetch user config + fetch package.json
   *
   * @returns {Promise<Version>}
   */
  public init(): Promise<Version> {
    console.debug(">>> application init");
    console.debug(">>> getting ntlm user");
    return this.httphandler.get(environment.NTLMserver + "?app=" + environment.name)
      .map( (r1) => r1.json() )
      .toPromise()
      .then( (r2) => {
        console.debug(">>> success " + r2.token);
        console.debug(">>> logging into REST API");
        return this.httphandler.get(environment.webserviceServer + loginURL + "/" + r2.token)
          .map((r3) => r3.text())
          .toPromise();
      })
      .then( (r4) => {
        console.debug(">>> result " + r4);
        if (r4 !== "OK") {
          console.error("*** Login not successful");
          throw new Error("could not login");
        }
        return r4;
      })
      .then( (r5) => {
        console.debug(">>> fetching user config");
        return this.fetchUserConfig().then((user) => {
          this.userSession = user;
          console.debug(">>> done");
          return "OK";
        });
      })
      .then( (r6) => {
        console.debug(">>> getting app meta data");
        return this.version.init().then( (ver) => {
          console.debug(">>> done");
          console.info(ver.displayname + " v" + ver.version + " " + ver.copyright);
          return ver;
        });
      });

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

  public getUser(): Observable<any> {
    return this.httphandler.get(this.restServer + "/whoami/")
        .map((response: Response) => response.json());
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
  public getUserConfig(): UserSession {
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
        console.debug("user conf saved");
      });
  }

  /**
   * Benutzer-Config aus der DB holen
   *
   */
  private fetchUserConfig(): Promise<UserSession> {
    console.debug("fetchUserConfig");
    return this.getConfig(confUSER).toPromise().then( (conf) => {
        this.userData = conf;
        if (this.userData === null) {
          this.userData = { treepath: [] };
        }
        const us: UserSession = new UserSession(this.userDataChange, this.userData);
        return this.getUser().toPromise().then( (u) => {
          us.UID = u.uid;
          us.name = u.name;
          us.vorname = u.vorname;
          us.mail = u.mail;
          return us;
        });
      });
  }

}
