FROM node:18-alpine AS dependencies

WORKDIR /build

COPY package.json ./

RUN npm install --omit=dev

# Copia el resto del código fuente
COPY . .

# Genera el build de tu aplicación (React/Angular/Vue)
RUN npm run build

FROM nginx:alpine

# Limpia contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Incluye MSAL en la imagen para no depender de un CDN externo
COPY --from=dependencies /build/node_modules/@azure/msal-browser /usr/share/nginx/html/msal

# Copia el build final al directorio que sirve Nginx
COPY --from=dependencies /build/dist /usr/share/nginx/html

# Copia tu configuración personalizada de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para Nginx
EXPOSE 80



