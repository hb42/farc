// --env=prod

export const environment = {
  production: true,
  // interner Name
  name: "farc",
  // REST-API
  webserviceServer: "http://calvados:23100",
  webservicePath: "/farc",
  // NTLM-Logon
  NTLMserver: "http://calvados:23142/asp/get",
  authType: "NTLM",
  // WebApp
  webappServer: "http://calvados:23000",
};
