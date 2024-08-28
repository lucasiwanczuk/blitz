import dotenv from 'dotenv';
dotenv.config();

// Usuário e senha VivaIntra
export const usuario = process.env.USUARIO_INTRA;
export const senha = process.env.SENHA_INTRA;

// Configs banco de dados
export const hostdb = process.env.HOST_DB;
export const userdb = process.env.USER_DB;
export const passdb = process.env.PASSWORD_DB;

// Nome do arquivo e path para download
export const fileName = 'exported_file.csv';
export const downloadPath = './';