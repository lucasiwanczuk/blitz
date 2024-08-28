#!/bin/bash

# Inicie o cron em background
service cron start

# Execute o script de scraping imediatamente
/usr/local/bin/node ./index.js &

# Mantenha o container em execução
tail -f /dev/null
