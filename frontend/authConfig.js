// URL pública HTTPS del frontend (Redirect URI registrada en Azure)
const FRONTEND_URL = "https://c5ipa4zw2f.execute-api.us-east-1.amazonaws.com/prod/login";

const authConfig = {
  admin: {
    msal: {
      auth: {
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70", // SPA
        authority: "https://login.microsoftonline.com/ea6b8b9d-33ce-49ad-95e6-551bce054fe7", // Tenant interno
        redirectUri: FRONTEND_URL, // debe coincidir EXACTO con lo registrado en Azure
        postLogoutRedirectUri: FRONTEND_URL,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    },
    loginRequest: {
      scopes: [
        "openid",
        "profile",
        "email",
        "api://867cb7d6-fb20-4444-a63a-091a278be14d/access_as_user"
      ],
    },
  },
   
  cliente: {
    msal: {
      auth: {
        // >>> COMPLETAR (Azure, tenant EXTERNO / External ID): "Application (client) ID" de la app SPA de clientes.
        // Portal Microsoft Entra admin center > (cambia al tenant externo) > App registrations > <app SPA clientes> > Overview.
        clientId: "REEMPLAZAR_CLIENT_ID_SPA_CLIENTE",
        // >>> COMPLETAR (Azure, tenant externo): subdominio del tenant externo (la parte antes de ".onmicrosoft.com").
        // Entra admin center > tenant externo > Overview > "Primary domain" = <SUBDOMINIO>.onmicrosoft.com.
        // Es External ID (ciamlogin.com), NO Azure AD B2C (b2clogin.com): el backend valida el emisor ciamlogin.com.
        authority: "https://REEMPLAZAR_SUBDOMINIO_EXTERNO.ciamlogin.com/",
        // >>> COMPLETAR: mismo subdominio externo, sin "https://" ni "/" final.
        knownAuthorities: ["REEMPLAZAR_SUBDOMINIO_EXTERNO.ciamlogin.com"],
        redirectUri: FRONTEND_URL,
        postLogoutRedirectUri: FRONTEND_URL,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    },
    loginRequest: {
      // >>> COMPLETAR (Azure, tenant externo): "Application (client) ID" de la app registrada en el tenant EXTERNO que expone la API.
      // Debe coincidir con AAD_EXTERNAL_AUDIENCE del backend.
      // Scope creado en: App registrations (tenant externo) > <app API> > Expose an API > Add a scope "access_as_user_client".
      scopes: ["openid", "profile", "email", "api://867c7db6-f620-4444-a63a-091a278be14d/access_as_user", // "api://REEMPLAZAR_CLIENT_ID_API_CLIENTE/access_as_user_client"],
    },
  },
};
