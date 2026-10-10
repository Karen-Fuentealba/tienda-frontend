FROM nginx:alpine

# Limpia contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia tus archivos estáticos (HTML, CSS, JS) directamente al directorio de Nginx
COPY . /usr/share/nginx/html

# Copia tu configuración personalizada de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para Nginx
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]



