# 📌 Blitz – Gestão de Chamados de TI

🚀 **Descrição do Projeto:**  
Sistema para gerenciamento de chamados de TI, integrando dados de planilhas CSV ao banco de dados PostgreSQL e visualizando informações de chamados abertos e fechados por meio de um dashboard interativo no Metabase.

---

<img src="https://raw.githubusercontent.com/lucasiwanczuk/blitz/main/dash.png" alt="Preview do Sistema" style="width:100%; border-radius: 8px;" />

---

## 💼 Desenvolvedor Full Stack  

Projeto desenvolvido como parte da minha jornada em desenvolvimento full stack, realizado na empresa **VivaIntra**, entre **Julho de 2023 e Dezembro de 2023**.  
Focado em automação de processamento de dados de chamados, integração com banco de dados e visualização de métricas em tempo real.

---

## 🧠 Funcionalidades Principais

- ✅ Processamento e importação de dados CSV para PostgreSQL  
- ✅ Visualização de indicadores de chamados abertos e fechados via Metabase  
- ✅ Integração com API de monitoramento para obter dados em tempo real  
- ✅ Interface simples e direta para facilitar a gestão de dados

---

## 🛠️ Tecnologias Utilizadas

| Categoria      | Tecnologias                          |
|----------------|--------------------------------------|
| Backend        | Node.js, Puppeteer, Express          |
| Banco de Dados | PostgreSQL                           |
| Frontend       | HTML, Tailwind CSS                   |
| Visualização   | Metabase                             |

---

## 📦 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/lucasiwanczuk/blitz.git

# Acesse a pasta do projeto
cd blitz

# Instale as dependências
npm install

# Configure o banco de dados PostgreSQL conforme o schema incluído no projeto
# Configure as variáveis de ambiente (exemplo: .env)

# Inicie o servidor
node index.js
