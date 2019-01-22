import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable, } from "@angular/core";

import { AppConfig, ErrorService, LogonService, SseHandler, Version, VersionService, } from "@hb42/lib-client";
import { dateString } from "@hb42/lib-common";
import {
  apiCONFIG, apiROOT,
  confPACK, confTREEDATE,
  confUSER,
  getConfigValue,
  setConfigValue,
  sseNAME,
  sseNEWTREE,
  sseNEWVORM
} from "@hb42/lib-farc";
import * as semver from "semver";
import { StatusService } from "./status.component";

import { UserData, } from "./user-data";
import { UserSession, } from "./user-session";
import { WhatsNew, } from "./whats.new";
import Timeout = NodeJS.Timeout;

/**
 * Konfiguration-Daten vom Server laden/speichern
 *
 * Wird vor allen anderen Modulen geladen
 *
 * Die benutzerspezifischen Daten werden in einem {@UserSession}-Objekt
 * gespeichert. Jede Aenderung an den Daten loesst einen Event aus,
 * (-> this.userDataChange) der sich ums Speichern kuemmert
 * (s.a. {@link UserData}).
 *
 */
@Injectable()
export class ConfigService {

  // Empfang von SSE
  public sse: SseHandler;

  public whatsnew: WhatsNew;
  public lastReadDate = "";

  private restServer: string;
  private userSession: UserSession;
  private userDataChange: EventEmitter<UserData> = new EventEmitter();

  private timer: Timeout;

  constructor(private http: HttpClient,
              private logonService: LogonService,  // autologon handling
              private version: VersionService,
              private errorService: ErrorService,
              private status: StatusService) {
    console.debug("c'tor ConfigService");
    this.restServer = AppConfig.settings.webserviceServer + apiROOT;

    // in den Event fuer Benutzer-Config-Aenderungen einklinken
    this.userDataChange.subscribe(() => {
      this.saveUserConfig();
    });
  }

  /**
   * fetch user config + fetch package.json
   * (Stoesst implizit den Autologon an -> {@link LogonService}
   *
   * @returns {Promise<Version>}
   */
  public init(): Promise<Version> {
    console.debug(">>> fetching user config");
    return this.fetchUserConfig().then((user) => {
      this.userSession = user;
      console.debug(">>> user config done");
      return "OK";
    }).then((result) => {
      console.debug(">>> getting app meta data");
      return this.version.init(this.restServer + apiCONFIG + "/" + confPACK).then((ver) => {
        console.debug(">>> meta data done");
        console.info(ver.displayname + " v" + ver.version + " " + ver.copyright + " (" + ver.githash + ")");
        console.dir(ver.versions);
        const server = this.version.serverVer;
        console.info(server.displayname + " v" + server.version + " " + server.copyright + " (" + server.githash + ")");
        console.dir(server.versions);

        // Datum des letzten Einlesens
        this.getConfig(confTREEDATE).then((millis: number) => {
          this.lastReadDate = dateString(millis);
          this.status.setDefault("Stand der Daten: " + this.lastReadDate);
        });

        // SSE init
        this.sse = new SseHandler(AppConfig.settings.webserviceServer, sseNAME);

        // SSE event
        // Verzeichnisse wurden vom Server neu eingelesen
        // => App neu laden, dadurch wird der aktualisierte Baum geholt
        const newtreeListener =  (evt: MessageEvent) => {
          console.debug("SSE eventListener: new tree");
          this.errorService.resetApp();
        };
        this.sse.addEventListener(sseNEWTREE, newtreeListener);

        // SSE event
        // Alle Vormerkungen wurden erledigt
        // => App neu laden
        // Alle Vormerkungen ausfuehren erledigt normalerweise der Cron-Job in der Nacht, davon merkt
        // der Client nichts. Fuer den seltenen Fall, dass das unter Tag laeuft. lohnt sich der Aufwand
        // nicht, die Vormerkungen im lokalen Baum zu suchen und zu entfernen. Das ist ein App-Reset
        // einfacher.
        const newVormerkListener =  (evt: MessageEvent) => {
          console.debug("SSE eventListener: reset vormerk");
          this.errorService.resetApp();
        };
        this.sse.addEventListener(sseNEWVORM, newVormerkListener);

        // What's new holen
        return this.http.get("./resource/whatsnew.json").toPromise()
          .then((wn: WhatsNew) => {
            this.whatsnew = wn;
            return ver;
          });
      })
    });

  }

  /**
   * What's new wird angezeigt, wenn der User das erste mal das Programm startet
   * und wenn sich die Programm-Version seit dem letzten Aufruf geaendert hat
   * (verglichen wird nur major und minor).
   *
   */
  public checkWhatsNew(): boolean {
    const run = this.version.ver.version;
    if (!semver.valid(run)) {
      console.error("Konnte Programm-Version nicht ermitteln");
      return;
    }
    const last = this.getUserConfig().lastSeenVersion;
    let show = false;
    if (!semver.valid(last)) {
      show = true;
    } else {
      // nur die beiden ersten Stellen der Version vergleichen, Aenderungen auf der dritten Stelle
      // werden ignoriert, ebenso beta- oder rc-Releases.
      show = !semver.prerelease(run) && (semver.major(run) > semver.major(last) ||
             (semver.major(run) === semver.major(last) && semver.minor(run) > semver.minor(last)));
    }
    if (show) {
      this.getUserConfig().lastSeenVersion = run;
    }
    return show;
  }

  /**
   * Benutzer-Config
   *
   */
  public getUserConfig(): UserSession {
    return this.userSession;
  }

  /**
   * Sonstige Config
   *
   */
  public getConfig(confName: string): Promise<any> {
    return this.http.get(this.restServer + apiCONFIG + "/" + confName).toPromise().then((val) => {
      return getConfigValue(val);
    });
  }

  public saveConfig(confName: string, value: any): Promise<any> {
    const val = setConfigValue(value);
    if (val === undefined) {
      return;
    }
    if (val === null) {
      return this.deleteConfig(confName);
    }
    return this.http.post(this.restServer + apiCONFIG + "/" + confName, val).toPromise().then( (rc) => {
      return rc;
    });
  }

  public deleteConfig(confName: string): Promise <any> {
    return this.http.delete(this.restServer + apiCONFIG + "/" + confName).toPromise().then((rc) => {
      return rc;
    });
  }

  /**
   * Benutzer_Config sichern
   *
   * Wird per Event bei Aenderung in UserSession ausgeloest. Das Speichern wird
   * verzoegert, um die Server- und Netzlast zu verringern.
   */
  private saveUserConfig() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.saveConfig(confUSER, this.userSession.data).then((rc) => {
        console.debug("user conf saved");
      });
    }, 3000);
  }

  /**
   * Benutzer-Config aus der DB holen und neues {@link UserSession}-
   * Objekt erzeugen.
   *
   */
  private fetchUserConfig(): Promise<UserSession> {
    return this.getConfig(confUSER).then((userdata) => {
      return new UserSession(this.userDataChange, userdata, this.logonService);
    });
  }

}
