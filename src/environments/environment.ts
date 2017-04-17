// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// --env=dev

export const environment = {
  production: false,
  // REST-API
  webserviceServer: "http://calvados:23100",
  webservicePath: "/farc",
  // NTLM-Logon
  NTLMserver: "http://calvados:23142/asp/get",
  authType: "NTLM",
  // WebApp
  webappServer: "http://calvados:23000",
};
