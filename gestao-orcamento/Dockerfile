# Etapa 1: Build do React
FROM node:18-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Build do React
RUN npm run build

# Etapa 2: Servir o build com Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta exposta
EXPOSE 80

# Rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
