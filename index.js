import puppeteer from "puppeteer";
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import pkg from 'pg';
import winston from 'winston';
import { scheduleJob } from "node-schedule";
dotenv.config();
// USUARIO_INTRA="03244525008"
// SENHA_INTRA="VK6-GA&)duW9YMK6"
// HOST_DB="177.126.159.93"
// USER_DB="postgres"
// PASSWORD_DB="123@mudar"
const usuario = "03244525008";
const senha = "VK6-GA&)duW9YMK6";
const hostdb = "177.126.159.93";
const userdb = "postgres";
const passdb = "123@mudar";
const { Client } = pkg;
const downloadPath = "./";
const fileName = "export_file.csv";

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // Você pode adicionar mais transportes como arquivo, etc.
  ],
});

// const client = new Client({
//   user: userdb,
//   host: hostdb,
//   database: 'db_chamados',
//   password: passdb,
//   port: 8877, // ou a porta que você estiver usando
// });


async function main() {

  const columnMapping = {
    'Código': 'cod_protocol',
    'Assunto': 'subject',
    'Contato': 'contact',
    'Email do Contato': 'contact_email',
    'Unidade': 'unit',
    'Departamento': 'department',
    'Cargo': 'position',
    'Tipo': 'type',
    'Situação': 'status',
    'Atendente': 'attendant',
    'Grupo': 'group',
    'Prioridade': 'priority',
    'Criado Em': 'created_at',
    'Prazo da primeira resposta': 'first_response_deadline',
    'Primeira resposta': 'first_response',
    'Prazo de resolução': 'resolution_deadline',
    'Concluído Em': 'completed_at',
    'Ultima alteração': 'last_modified',
    'SLA': 'sla',
    'Primeira atribuição em': 'first_assignment_at',
    'Cancelado Em': 'canceled_at'
  };

  const client = new Client({
    user: userdb,
    host: hostdb,
    database: 'db_chamados',
    password: passdb,
    port: 8877, // ou a porta que você estiver usando
  });

  // Inicia o Script
  console.log('Iniciando o navegador...');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // ###################
  const url = 'https://intra.mundovoa.com/admin/helpdesk/chamado/exportar';
  console.log(`Acessando a URL: ${url}`);
  await page.goto(url);

  // ###################
  console.log(`Inserindo o nome de usuário: ${usuario}`);
  await page.type('#username', usuario);

  // ###################
  console.log('Clicando no botão de acessar...');
  await page.click('button[type="submit"]');

  // ###################
  console.log('Aguardando a página carregar...');
  await page.waitForSelector('#password');

  // ###################
  console.log('Inserindo a senha...');
  await page.type('#password', senha);

  // ###################
  console.log('Clicando no botão de entrar...');
  await page.click('button[type="submit"]');

  // ###################
  console.log('Aguardando a página carregar...');
  await page.waitForSelector('input[name="confirm-password"]');

  // ###################
  console.log(`Acessando a URL de export: ${url}`);
  await page.goto(url);

  // ###################
  console.log('Inserindo a senha...');
  await page.type('input[name="confirm-password"]', senha);

  // ###################
  console.log('Clicando no botão de entrar...');
  await page.click('button[type="submit"]');

  // Agora que estamos autenticados, podemos capturar o link do arquivo
  const downloadUrl = 'https://intra.mundovoa.com/admin/helpdesk/chamado/exportar'; // Link do arquivo
  console.log(`Capturando o link de download: ${downloadUrl}`);

  // Utilizando node-fetch para realizar o download diretamente após a autenticação
  const response = await fetch(downloadUrl, {
    headers: {
      'cookie': await page.cookies().then(cookies => cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')),
    },
  });

  if (!response.ok) throw new Error(`Erro ao baixar o arquivo: ${response.statusText}`);

  // Cria o stream de escrita para salvar o arquivo na pasta definida
  const fileStream = fs.createWriteStream(path.join(downloadPath, fileName));
  console.log('Baixando o arquivo...');

  // Salva o arquivo binário
  response.body.pipe(fileStream);
  response.body.on('error', (err) => {
    console.error('Erro ao salvar o arquivo:', err);
  });

  fileStream.on('finish', () => {
    console.log('Arquivo baixado com sucesso!');
  });

  // Fecha o navegador após o download
  await browser.close();

  // Conecte-se ao banco de dados
  await client.connect();

  // Caminho para o arquivo CSV
  const filePath = path.join(downloadPath, fileName);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Função para processar o CSV e inserir dados no banco
  async function processCSV() {
    return new Promise((resolve, reject) => {
      const results = [];
  
      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: ';' }))  // Especifica o delimitador como ponto e vírgula
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            const queryText = `
              INSERT INTO int_chamados_ti ("cod_protocol", "subject", "contact", "contact_email", "unit", "department", "position", "type", "status", "attendant", "group", "priority", "created_at", "first_response_deadline", "first_response", "resolution_deadline", "completed_at", "last_modified", "sla", "first_assignment_at", "canceled_at")
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
              ON CONFLICT ("cod_protocol")
              DO UPDATE SET
                "subject" = EXCLUDED."subject",
                "contact" = EXCLUDED."contact",
                "contact_email" = EXCLUDED."contact_email",
                "unit" = EXCLUDED."unit",
                "department" = EXCLUDED."department",
                "position" = EXCLUDED."position",
                "type" = EXCLUDED."type",
                "status" = EXCLUDED."status",
                "attendant" = EXCLUDED."attendant",
                "group" = EXCLUDED."group",
                "priority" = EXCLUDED."priority",
                "created_at" = EXCLUDED."created_at",
                "first_response_deadline" = EXCLUDED."first_response_deadline",
                "first_response" = EXCLUDED."first_response",
                "resolution_deadline" = EXCLUDED."resolution_deadline",
                "completed_at" = EXCLUDED."completed_at",
                "last_modified" = EXCLUDED."last_modified",
                "sla" = EXCLUDED."sla",
                "first_assignment_at" = EXCLUDED."first_assignment_at",
                "canceled_at" = EXCLUDED."canceled_at";
            `;
  
            // Executa a inserção em lote
            const promises = results.map(row => {
              const values = Object.values(row);
              return client.query(queryText, values);
            });
  
            await Promise.all(promises);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });
  }
  
  await sleep(10000);  // Pausa de 10 segundos
  // Execute o processamento
  try {
    await processCSV();
    console.log('Dados inseridos com sucesso!');
  } catch (err) {
    console.error('Erro ao processar o CSV:', err);
  } finally {
    // Encerre a conexão com o banco de dados
    await client.end();
  }

  // Função para deletar o CSV após o final
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Erro ao tentar deletar o arquivo: ${err}`);
    } else {
      console.log('Arquivo deletado com sucesso.');
    }
  });

  // Use o logger para mostrar a data e hora junto com a mensagem
  logger.info('Script executado');

}

const job = scheduleJob('0,10,15,30,40,45 7-19 * * *', function () {
  main()
});