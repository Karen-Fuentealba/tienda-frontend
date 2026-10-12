// =====================================================================
// Configuración de autenticación (MSAL.js) para Tienda Perritos.
//
//  - "admin"   -> Microsoft Entra ID (tenant interno / workforce).
//  - "cliente" -> Microsoft Entra External ID (tenant externo / customers, dominio ciamlogin.com).
//
// Todos los valores marcados con ">>> COMPLETAR" salen del portal de Azure.
// El paso a paso está en GUIA_DESPLIEGUE.md.
// =====================================================================

// URL pública HTTPS del frontend (Redirect URI registrada en Azure)

const FRONTEND_URL = "https://21009y3jsk.execute-api.us-east-1.amazonaws.com/dev";

/*const authConfig = {
  admin: {
    msal: {
      auth: {
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70", // SPA interna
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
        "api://867cb7d6-fb20-4444-a63a-091a278be14d/access_as_user" // scope expuesto en la API
      ],
    },
  }, */
const authConfig = {
  admin: {
    msal: {
      auth: {
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70", // AAD_AUDIENCE
        authority: "https://login.microsoftonline.com/ea6b8b9d-33ce-49ad-95e6-551bce054fe7", // AAD_TENANT_ID
        redirectUri: "http://34.202.142.177/",
        postLogoutRedirectUri: "http://34.202.142.177/"
      }
    },
    loginRequest: {
      scopes: [
        "api://9c61f329-5d50-41a9-be4d-557d53935f70/access_as_user"
      ]
    }
  }
};



const authConfig = {
  cliente: {
    msal: {
      auth: {
        clientId: "1f5523aa-a8f7-4fe2-b3f9-0de78f21adbc", // AAD_EXTERNAL_AUDIENCE
        authority: "https://karen004v.ciamlogin.com/b5253255-4e61-4557-bf3f-661f8dc60447", // dominio CIAM + Tenant externo
        knownAuthorities: ["karen004v.ciamlogin.com"], // tu subdominio CIAM
        redirectUri: "http://34.202.142.177/",
        postLogoutRedirectUri: "http://34.202.142.177/"
      }
    },
    loginRequest: {
      scopes: ["openid", "profile", "email", "api://1f5523aa-a8f7-4fe2-b3f9-0de78f21adbc/access_as_user_client"]
    }
  }
};

  /*
  cliente: {
    msal: {
      auth: {
        clientId: "REEMPLAZAR_CLIENT_ID_SPA_CLIENTE",
        authority: "https://REEMPLAZAR_SUBDOMINIO_EXTERNO.ciamlogin.com/",
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
      scopes: [
        "openid",
        "profile",
        "email",
        "api://REEMPLAZAR_CLIENT_ID_API_CLIENTE/access_as_user_client"
      ],
    },
  },
  */
};
