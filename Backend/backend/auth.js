const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const internalTenantId = process.env.AAD_TENANT_ID || "<TENANT_ID>";
const externalTenantId = process.env.AAD_EXTERNAL_TENANT_ID || "<EXTERNAL_TENANT_ID>";
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
    audience: acceptedAudiences(process.env.AAD_AUDIENCE || "<CLIENT_ID_DE_MI_APP_REGISTRADA_EN_AZURE>"),
    issuer: `https://login.microsoftonline.com/${internalTenantId}/v2.0`,
    client: createJwksClient(`https://login.microsoftonline.com/${internalTenantId}/discovery/v2.0/keys`),
  },
  {
    audience: acceptedAudiences(process.env.AAD_AUDIENCE || "<CLIENT_ID_DE_MI_APP_REGISTRADA_EN_AZURE>"),
    issuer: `https://sts.windows.net/${internalTenantId}/`,
    client: createJwksClient(`https://login.microsoftonline.com/${internalTenantId}/discovery/v2.0/keys`),
  },
  {
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