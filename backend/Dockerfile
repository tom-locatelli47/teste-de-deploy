FROM node:22-alpine

WORKDIR /app/backend

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar código da aplicação
COPY backend/src ./src

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
