FROM node:18-alpine AS dependencies

WORKDIR /build

COPY package.json ./

RUN npm install --omit=dev

FROM nginx:alpine

# Limpia contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Incluye MSAL en la imagen para no depender de un CDN externo.
COPY --from=dependencies /build/node_modules/@azure/msal-browser/lib/msal-browser.min.js /usr/share/nginx/html/vendor/msal-browser.min.js

# Copia los archivos del frontend
COPY index.html app.js authConfig.js authService.js /usr/share/nginx/html/

# Copia la configuración custom de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80