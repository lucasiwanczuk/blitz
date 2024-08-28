#!/bin/bash

# Inicie o cron em background
service cron start

# Mantenha o container em execução
tail -f /dev/null
