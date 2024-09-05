# Use uma imagem base do Node.js
FROM node:current-bullseye

# Crie e defina o diretório de trabalho no container
WORKDIR /usr/src/app

# Instale as dependências do sistema necessárias para o Puppeteer e o cron
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libnss3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    lsb-release \
    xdg-utils \
    vim \
    cron \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copie o package.json e package-lock.json (se houver) para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie todos os outros arquivos do projeto para o diretório de trabalho
COPY . /usr/src/app

# Copie o script de inicialização
RUN chmod +x /usr/src/app/start.sh
RUN chmod +x /usr/src/app/index.js

# Dê permissão ao start.sh
RUN chmod +x /usr/src/app/start.sh

# Exponha a porta que sua aplicação usará (se necessário)
EXPOSE 3001

# Comando para iniciar o cron e a aplicação
CMD ["/bin/bash", "/usr/src/app/start.sh"]
