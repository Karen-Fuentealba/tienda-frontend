const authConfig = {
  admin: {
    msal: {
      auth: {
        clientId: "9c61f329-5d50-41a9-be4d-557d53935f70",
        authority: "https://login.microsoftonline.com/ea6b8b9d-33ce-49ad-95e6-551bce054fe7",
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
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
        clientId: "a64dfa50-28aa-4285-b102-9d60c5d30f45",
        authority: "https://karen004v.ciamlogin.com/b5253255-4e61-4557-bf3f-661f8dc60447",
        knownAuthorities: ["karen004v.ciamlogin.com"],
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
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