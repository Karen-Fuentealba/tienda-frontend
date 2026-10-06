const accessTokenKey = "tienda-perritos.accessToken";
const identityProviderKey = "tienda-perritos.identityProvider";
const msalInstances = {
  admin: new msal.PublicClientApplication(authConfig.admin.msal),
  cliente: new msal.PublicClientApplication(authConfig.cliente.msal),
};
const initializationPromises = {};

function obtenerProveedor() {
  return localStorage.getItem(identityProviderKey) || "admin";
}

function obtenerInstancia(proveedor = obtenerProveedor()) {
  const instance = msalInstances[proveedor];
  if (!instance) {
    throw new Error("Proveedor de identidad no válido.");
  }
  return instance;
}

function inicializarMsal(proveedor = obtenerProveedor()) {
  initializationPromises[proveedor] ||= obtenerInstancia(proveedor).initialize();
  return initializationPromises[proveedor];
}

function obtenerCuentaActiva(msalInstance) {
  return msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
}

function guardarToken(accessToken) {
  if (accessToken) {
    localStorage.setItem(accessTokenKey, accessToken);
  }
}

async function inicializarAutenticacion() {
  const proveedor = obtenerProveedor();
  const msalInstance = obtenerInstancia(proveedor);
  await inicializarMsal(proveedor);
  const redirectResponse = await msalInstance.handleRedirectPromise();
  let account = redirectResponse?.account || obtenerCuentaActiva(msalInstance);

  if (account) {
    msalInstance.setActiveAccount(account);
    guardarToken(redirectResponse?.accessToken);
    return account;
  }

  for (const proveedorAlternativo of Object.keys(msalInstances)) {
    if (proveedorAlternativo === proveedor) continue;

    const instanciaAlternativa = obtenerInstancia(proveedorAlternativo);
    await inicializarMsal(proveedorAlternativo);
    account = obtenerCuentaActiva(instanciaAlternativa);
    if (account) {
      localStorage.setItem(identityProviderKey, proveedorAlternativo);
      instanciaAlternativa.setActiveAccount(account);
      return account;
    }
  }

  return null;
}

async function iniciarSesion(proveedor) {
  localStorage.setItem(identityProviderKey, proveedor);
  const msalInstance = obtenerInstancia(proveedor);
  await inicializarMsal(proveedor);
  return msalInstance.loginRedirect({
    ...authConfig[proveedor].loginRequest,
    prompt: "login",
  });
}

async function obtenerTokenDeAcceso() {
  const proveedor = obtenerProveedor();
  const msalInstance = obtenerInstancia(proveedor);
  await inicializarMsal(proveedor);
  const account = msalInstance.getActiveAccount();
  if (!account) {
    throw new Error("No hay una sesión activa.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...authConfig[proveedor].loginRequest,
      account,
    });
    guardarToken(response.accessToken);
    return response.accessToken;
  } catch (error) {
    if (error instanceof msal.InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(authConfig[proveedor].loginRequest);
    }
    throw error;
  }
}

async function cerrarSesion() {
  const proveedor = obtenerProveedor();
  const msalInstance = obtenerInstancia(proveedor);
  await inicializarMsal(proveedor);
  const account = msalInstance.getActiveAccount();
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(identityProviderKey);
  msalInstance.setActiveAccount(null);
  await msalInstance.clearCache({ account });
  window.location.assign(authConfig[proveedor].msal.auth.postLogoutRedirectUri);
}

async function obtenerRoles() {
  if (obtenerProveedor() === "cliente") {
    return ["CLIENTE"];
  }

  const accessToken = await obtenerTokenDeAcceso();
  const payload = accessToken.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))));
  return Array.isArray(claims.roles) ? claims.roles : [];
}

window.authService = {
  inicializarAutenticacion,
  iniciarSesion,
  obtenerTokenDeAcceso,
  obtenerRoles,
  cerrarSesion,
};