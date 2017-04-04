/**
 * Created by hb on 02.04.17.
 */

// die beiden Werte kommen von Webpack
declare const __PROD__: boolean;
declare const __SPK__: boolean;
declare const __VERSION__;

export const environment = {
  version: __VERSION__,
  production: __PROD__,
  sparkasse: __SPK__,
  // REST-API
  webserviceServer: __SPK__ ? "http://5.77.32.210:23000" : "http://localhost:23000",
  webservicePath: "/farc",
  // NTLM-Logon
  NTLMserver: __SPK__ ? "http://e077app.v998dpve.v998.intern/791/farc/auth.asp" : "http://localhost:23042/asp/get",
  authType: "NTLM",
};
