// =====================================================================
// Configuración de autenticación (MSAL.js) para Tienda Perritos.
//
//  - "admin"   -> Microsoft Entra ID (tenant interno / workforce).
//  - "cliente" -> Microsoft Entra External ID (tenant externo / customers, dominio ciamlogin.com).
//
// Todos los valores marcados con ">>> COMPLETAR" salen del portal de Azure.
// El paso a paso está en GUIA_DESPLIEGUE.md.
// =====================================================================

// >>> COMPLETAR (AWS): URL pública HTTPS desde la que se sirve el frontend, TERMINADA EN "/".
// Es la "Invoke URL" de API Gateway + "/" (API Gateway > tu API > Stages > <stage>).
// Ejemplo: "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/"
// Debe ser EXACTAMENTE la misma que registres como "Redirect URI" (tipo SPA) en las dos apps de Azure.
// Azure solo acepta http:// para localhost; en AWS necesitas https (por eso se usa API Gateway).
const FRONTEND_URL = "https://c5ipa4zw2f.execute-api.us-east-1.amazonaws.com/prod/";  // "https://REEMPLAZAR_API_ID.execute-api.us-east-1.amazonaws.com/dev/"; YA HECHO

const authConfig = {
  admin: {
    msal: {
      auth: {
        // >>> COMPLETAR (Azure, tenant interno): "Application (client) ID" de la app registrada para la SPA.
        // Portal Azure > Microsoft Entra ID > App registrations > <tu app SPA> > Overview.
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70",              //"REEMPLAZAR_CLIENT_ID_SPA_ADMIN", YA HECHO!!
        // >>> COMPLETAR (Azure, tenant interno): "Directory (tenant) ID".
        // Portal Azure > Microsoft Entra ID > Overview > Tenant ID. Debe ser el mismo valor de AAD_TENANT_ID del backend.
        authority: "https://login.microsoftonline.com/9c61f329-5d50-41a9-be4d-557d53935f70", //REEMPLAZAR_TENANT_ID_INTERNO", YA HECHO
        redirectUri: "https://c5ipa4zw2f.execute-api.us-east-1.amazonaws.com/prod/login", //FRONTEND_URL,
        postLogoutRedirectUri: FRONTEND_URL,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    },
    loginRequest: {
      // >>> COMPLETAR (Azure, tenant interno): "Application (client) ID" de la app que expone la API (la del backend).
      // Puede ser la misma que la SPA si expusiste el scope "access_as_user" en esa misma app.
      // Debe coincidir con AAD_AUDIENCE del backend.
      // Scope creado en: App registrations > <app API> > Expose an API > Add a scope.
      scopes: ["openid", "profile", "email", "api://REEMPLAZAR_CLIENT_ID_API_ADMIN/access_as_user"],
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
      scopes: ["openid", "profile", "email", "api://REEMPLAZAR_CLIENT_ID_API_CLIENTE/access_as_user_client"],
    },
  },
};
