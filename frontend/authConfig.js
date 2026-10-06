const authConfig = {
  admin: {
    msal: {
      auth: {
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70", // SPA Admin
        authority: "https://login.microsoftonline.com/ea6b8b9d-33ce-49ad-95e6-551bce054fe7", // Tenant interno Karen004D
        redirectUri: "https://oyvhdgexqa.execute-api.us-east-1.amazonaws.com/dev",
        postLogoutRedirectUri: "https://oyvhdgexqa.execute-api.us-east-1.amazonaws.com/dev",
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    },
    loginRequest: {
      scopes: ["openid", "profile", "email", "api://9c61f329-5d50-41a9-be4d-557d53935f70/access_as_user"],
    },
  },
  cliente: {
    msal: {
      auth: {
        clientId: "a64dfa50-28aa-4285-b102-9d60c5d30f45", // SPA Cliente
        authority: "https://Karen004V.b2clogin.com/Karen004V.onmicrosoft.com/B2C_1_signupsignin", // Tenant externo Karen004V + policy
        knownAuthorities: ["Karen004V.b2clogin.com"],
        redirectUri: "https://oyvhdgexqa.execute-api.us-east-1.amazonaws.com/dev",
        postLogoutRedirectUri: "https://oyvhdgexqa.execute-api.us-east-1.amazonaws.com/dev",
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    },
    loginRequest: {
      scopes: ["openid", "profile", "email", "api://1f5523aa-a8f7-4fe2-b3f9-0de78f21adbc/access_as_user_client"],
    },
  },
};
