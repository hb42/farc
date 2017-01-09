/*
 * Anwendugnsstart
 *
 * Konfig holen, Benutzer anmelden und Angular-App starten
 */

import {
    platformBrowserDynamic,
} from "@angular/platform-browser-dynamic";

import {
    createAppModule,
} from "./app";

import {
    keepaliveMinutes,
    keepaliveURL,
    loginURL,
} from "@hb42/lib-common";

/**
 * Diverse Informationen, die von Webpack hier eingesetzt werden
 */
declare var WEBPACK_DATA;
const metadata = WEBPACK_DATA.metadata;
process.env.ENV = metadata.ENV;
process.env.NODE_ENV = metadata.NODE_ENV;

/**
 * Benutzer config vom Webserver (wird bei von login() geholt)
 */
let sessiondata: Object;
/**
 * Server-Konfig aus Datei (wird von getConfig() geholt)
 */
let config: any;

/**
 * XMLHttpRequest (ajax)
 *
 * @param url  - Zieladresse
 * @param success - callback bei Erfolg
 * @param payload - Objekt fuer POST bzw. null f. GET
 */
let ajaxcall = (url: string, success, payload ) => {
  let ajax = new XMLHttpRequest();
  ajax.withCredentials = true;  // wg. NTLM

  let type = payload ? "POST" : "GET";
  // Fehler beim ajax call
  ajax.onerror = (err: ErrorEvent) => {
    console.error("Fehler beim Aufruf von " + url + ": " + err);
  };
  // ajax call return
  ajax.onload = (evt: ProgressEvent) => {
    let res: XMLHttpRequest = <XMLHttpRequest> evt.target;
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
 * session keep alive
 */
let keepalive = () => {
  window.setInterval(
      () => {
        ajaxcall(config.webserviceServer + keepaliveURL,
                 (res: XMLHttpRequest) => { console.info("keepalive ", res.responseText); },
                 null);
      }, 1000 * 60 * keepaliveMinutes );
};

/**
 * 1. callback: Anwendungs-Config per ajax holen
 *
 *    Die Config-Datei wird von Webpack ins /resource-Verzeichnis kopiert. Dadurch kann sie
 *    nachtraeglich geandert werden. Der Dateiname wird von Webpack im Objekt process.env.metadata
 *    uebergeben, was verschiedene Configs fuer unterschiedliche Builds ermoeglicht.
 *
 */
let getConfig = (res: XMLHttpRequest) => {
  config = JSON.parse(res.responseText);
  // -> (2) NTLM-Login
  ajaxcall(config.NTLMserver + "?app=" + metadata.NAME, ntlm, null);
};

/**
 * 2. callback: NTLM-Login am IIS liefert ein one time token vom Application-Server,
 *    mit dem sich der Client im naechsten Schritt anmeldet.
 *
 */
let ntlm = (res: XMLHttpRequest) => {
  console.info("ntlm response: ", res.responseText);
  // -> (3) login
  ajaxcall(config.webserviceServer + loginURL, login, res.responseText);
};

/**
 * 3. callback: Anmeldung am Server
 *
 *    Der Server setzt einen Session-Cookie und liefert ein Objekt mit den
 *    Benutzerdaten.
 *
 *    Mit den Webpack-Metadata, dem config-Objekt und den Benutzerdaten wird die Angular-Anwendung gestartet
 *
 */
let login = (res: XMLHttpRequest) => {
  sessiondata = JSON.parse(res.responseText);
  keepalive();
  // -> Angular App starten
  platformBrowserDynamic().bootstrapModule(createAppModule(metadata, config, sessiondata || {} ));
};

// -> (1) config holen
ajaxcall(metadata.CONFIGFILE, getConfig, null);
