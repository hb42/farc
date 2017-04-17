/*
 * Anwendugnsstart
 *
 * Konfig holen, Benutzer anmelden und Angular-App starten
 */

import {
  enableProdMode,
} from "@angular/core";
import {
  platformBrowserDynamic,
} from "@angular/platform-browser-dynamic";

import {
  AppModule,
} from "./app";
import {
  environment,
} from "./environments/environment";
import {
  loginURL,
} from "./shared/ext";

/**
 * XMLHttpRequest (ajax)
 *
 * @param url  - Zieladresse
 * @param success - callback bei Erfolg
 * @param payload - Objekt fuer POST bzw. null f. GET
 */
const ajaxcall = (url: string, success, payload ) => {
  const ajax = new XMLHttpRequest();
  ajax.withCredentials = true;  // wg. NTLM

  const type = payload ? "POST" : "GET";
  // Fehler beim ajax call
  ajax.onerror = (err: ErrorEvent) => {
    console.error("Fehler beim Aufruf von " + url + ": " + err);
  };
  // ajax call return
  ajax.onload = (evt: ProgressEvent) => {
    const res: XMLHttpRequest = evt.target as XMLHttpRequest;
    // hier landet auch ein 404
    if (res.status > 199 && res.status < 300) {
      // callback
      success(res);
    } else {
      console.error("Seite " + url + " meldet Fehler: " + res.statusText);
    }
  };
  // ajax call vorbereiten
  ajax.open(type, url);
  if (payload) {
    ajax.setRequestHeader("content-type", "application/json");
  }
  // XMLHttpRequest async starten (-> ajax.onload)
  ajax.send(payload);
};

/**
 * JSON-Configdatei einlesen
 */
// ajaxcall(metadata.CONFIGFILE, getConfig, null);
// const getConfig = (res: XMLHttpRequest) => {
//   config = JSON.parse(res.responseText);
//   // -> ggf. weiterer call
//   ajaxcall(metadata.CONFIG.NTLMserver + "?app=" + metadata.NAME, ntlm, null);
// };

/**
 * 1. callback: NTLM-Login am IIS liefert ein one time token vom Application-Server,
 *    mit dem sich der Client im naechsten Schritt anmeldet.
 *
 */
const ntlm = (res: XMLHttpRequest) => {
  console.info("ntlm response: ", res.responseText);
  // -> (2) login
  const token = JSON.parse(res.responseText).token;
  ajaxcall(environment.webserviceServer + loginURL + "/" + token, login, null);
};

/**
 * 2. callback: Anmeldung am Server
 *
 *    Der Server setzt einen Session-Cookie und liefert "OK" oder eine Fehlermeldung
 *    (bzw. der Server setzt Status 403)
 *
 *    Bei Erfolg wird die Angular-Anwendung gestartet
 *
 */
const login = (res: XMLHttpRequest) => {
  const rc = res.responseText;
  if (rc === "OK") {
    // ---
    // -> (3) Angular App starten
    if (environment.production) {
      enableProdMode();
    }
    platformBrowserDynamic().bootstrapModule(AppModule);
    // ---
  } else {
    console.error("LOGIN fehlgeschlagen: " + rc);
  }
};

// -> (1) NTLM-User holen
ajaxcall(environment.NTLMserver + "?app=" + "farc", ntlm, null);
// ajaxcall(environment.NTLMserver + "?app=" + environment.version.NAME, ntlm, null);
