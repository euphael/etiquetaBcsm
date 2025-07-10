# Etapa 1: Build da aplicação React
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

# Etapa 2: Servir com NGINX
FROM nginx:alpine AS production

RUN rm -drf /usr/share/nginx/html/50x.html
RUN rm -drf /etc/nginx/conf.d/default.conf
# Copia arquivos do build para o NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Copia configuração customizada do NGINX para suportar React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



