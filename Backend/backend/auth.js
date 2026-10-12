const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Estas variables se definen en Backend/.env (ver Backend/.env.example) y docker-compose las pasa al contenedor.
// >>> COMPLETAR (Azure, tenant interno): "Directory (tenant) ID" -> variable AAD_TENANT_ID.
// Portal Azure > Microsoft Entra ID > Overview > Tenant ID.
const internalTenantId = process.env.AAD_TENANT_ID || "<TENANT_ID>";
// >>> COMPLETAR (Azure, tenant externo / External ID): "Tenant ID" del tenant externo -> variable AAD_EXTERNAL_TENANT_ID.
// Entra admin center (tenant externo) > Overview > Tenant ID.
const externalTenantId = process.env.AAD_EXTERNAL_TENANT_ID || "<EXTERNAL_TENANT_ID>";
// >>> COMPLETAR (Azure, tenant externo): host de login del tenant externo -> variable AAD_EXTERNAL_AUTHORITY_HOST.
// Formato: <SUBDOMINIO>.ciamlogin.com (sin https://). Ejemplo: tiendaperritos.ciamlogin.com
const externalAuthorityHost = process.env.AAD_EXTERNAL_AUTHORITY_HOST || "<EXTERNAL_AUTHORITY_HOST>";

function createJwksClient(jwksUri) {
  return jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });
}

function acceptedAudiences(applicationId) {
  return [applicationId, `api://${applicationId}`];
}

const identityProviders = [
  {
    // >>> COMPLETAR (Azure, tenant interno): AAD_AUDIENCE = "Application (client) ID" de la app que expone la API.
    // Debe ser el mismo ID usado en el scope api://<ID>/access_as_user del frontend (authConfig.js).
    audience: acceptedAudiences(process.env.AAD_AUDIENCE || "<CLIENT_ID_DE_MI_APP_REGISTRADA_EN_AZURE>"),
    issuer: `https://login.microsoftonline.com/${internalTenantId}/v2.0`,
    client: createJwksClient(`https://login.microsoftonline.com/${internalTenantId}/discovery/v2.0/keys`),
  },
  {
    // Tokens v1 (emisor sts.windows.net): ocurren si la app API no tiene accessTokenAcceptedVersion = 2.
    audience: acceptedAudiences(process.env.AAD_AUDIENCE || "<CLIENT_ID_DE_MI_APP_REGISTRADA_EN_AZURE>"),
    issuer: `https://sts.windows.net/${internalTenantId}/`,
    client: createJwksClient(`https://login.microsoftonline.com/${internalTenantId}/discovery/v2.0/keys`),
  },
  {
    // >>> COMPLETAR (Azure, tenant externo): AAD_EXTERNAL_AUDIENCE = "Application (client) ID" de la app API del tenant EXTERNO.
    // Debe ser el mismo ID usado en el scope api://<ID>/access_as_user_client del frontend (authConfig.js).
    audience: acceptedAudiences(process.env.AAD_EXTERNAL_AUDIENCE || "<EXTERNAL_CLIENT_ID>"),
    issuer: `https://${externalTenantId}.ciamlogin.com/${externalTenantId}/v2.0`,
    client: createJwksClient(`https://${externalAuthorityHost}/${externalTenantId}/discovery/v2.0/keys`),
    role: "CLIENTE",
  },
];

function getSigningKey(client, header, callback) {
  if (!header.kid) {
    callback(new Error("El token no contiene un identificador de clave."));
    return;
  }

  client.getSigningKey(header.kid, (error, key) => {
    if (error) {
      callback(error);
      return;
    }

    callback(null, key.getPublicKey());
  });
}

function checkJwt(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Se requiere un token Bearer válido." });
    return;
  }

  const decodedToken = jwt.decode(token);
  const identityProvider = identityProviders.find((provider) => provider.issuer === decodedToken?.iss);

  if (!identityProvider) {
    res.status(401).json({ message: "El emisor del token no está autorizado." });
    return;
  }

  jwt.verify(
    token,
    getSigningKey.bind(null, identityProvider.client),
    {
      algorithms: ["RS256"],
      audience: identityProvider.audience,
      issuer: identityProvider.issuer,
    },
    (error, verifiedToken) => {
      if (error) {
        console.error("Token JWT inválido:", error.message);
        res.status(401).json({ message: "Token inválido o expirado." });
        return;
      }

      if (identityProvider.role) {
        verifiedToken.roles = [...new Set([...(verifiedToken.roles || []), identityProvider.role])];
      }

      req.auth = verifiedToken;
      next();
    }
  );
}

function checkRole(requiredRole) {
  return (req, res, next) => {
    const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];
    const groups = Array.isArray(req.auth?.groups) ? req.auth.groups : [];
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!requiredRoles.some((role) => roles.includes(role) || groups.includes(role))) {
      res.status(403).json({ message: "No tiene permisos para realizar esta acción." });
      return;
    }

    next();
  };
}

module.exports = { checkJwt, checkRole };
