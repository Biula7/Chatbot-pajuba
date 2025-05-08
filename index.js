// Importações
import { GoogleGenerativeAI } from "@google/generative-ai"; // CORRIGIDO
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";

// --- COLOQUE SUA API KEY AQUI (ou use variáveis de ambiente) ---
const API_KEY = "AIzaSyChzFz6KTBFwVzQ6FKccfOm8nWFoPdwdwc"; // SUBSTITUA PELA SUA CHAVE REAL!
// -----------------------------------------------------------------

if (!API_KEY || API_KEY === "") {
  console.error(chalk.red("ERRO: API KEY do Gemini não configurada. Por favor, substitua 'SUA_API_KEY_AQUI' pela sua chave real no código."));
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY); // CORRIGIDO

// Função para obter data e hora atual formatada
function getDateTimeInfo() {
  const now = new Date();
  const dia = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const hora = now.toLocaleTimeString("pt-BR");
  return `Hoje é ${dia} e agora são ${hora}.`;
}

// Função para exibir cabeçalho bonito
function showHeader() {
  console.clear();
  console.log(
    gradient.pastel(figlet.textSync("ChatBot Cliente", { horizontalLayout: "full" }))
  );
  console.log(chalk.cyanBright("🤖 Atendimento automatizado com Gemini + Node.js\n"));
}

// Envia prompt para o Gemini (FUNÇÃO CORRIGIDA)
async function consultarGemini(pergunta, nome) {
  const promptCompleto = `
Você é um assistente simpático de atendimento ao cliente.
Se a pergunta do cliente for sobre horário ou data, responda com base no sistema usando esta info: "${getDateTimeInfo()}".
Se for outra dúvida, responda normalmente de forma clara e amigável.

Nome do cliente: ${nome}
Pergunta: ${pergunta}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(promptCompleto);
    const response = result.response;

    if (response && typeof response.text === 'function') {
      return response.text();
    } else if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text) {
      console.warn(chalk.yellow("Aviso: Usando fallback para acessar o texto da resposta do Gemini."));
      return response.candidates[0].content.parts[0].text;
    } else {
      console.error(chalk.red("❌ Resposta inesperada da API Gemini:"), JSON.stringify(result, null, 2));
      throw new Error("A API Gemini não retornou um texto válido na resposta.");
    }
  } catch (error) {
    console.error(chalk.red("❌ Erro detalhado ao consultar Gemini: "), error.message);
    // Propagar o erro para ser tratado na função main
    if (error.message.includes("API Gemini não retornou")) {
        throw error;
    }
    // Para erros de API Key ou outros problemas de comunicação
    if (error.message && (error.message.includes('[GoogleGenerativeAI Error]: Error fetching from GoogleGenerativeAI') || error.message.includes('API key not valid'))) {
        throw new Error("Problema com a API Key ou permissões. Verifique sua chave e as configurações da API.");
    }
    throw new Error(`Falha na comunicação com a API Gemini: ${error.message || 'Erro desconhecido'}`);
  }
}

// Função principal
async function main() {
  showHeader();

  const rl = readline.createInterface({ input, output });

  console.log(chalk.greenBright("📝 Olá! Seja bem-vindo ao nosso atendimento automatizado."));
  const nome = await rl.question(chalk.yellow("📛 Qual seu nome? "));
  console.log(chalk.blue(`Olá, ${nome}! Pode me perguntar qualquer coisa.`));

  while (true) {
    const pergunta = await rl.question(chalk.magenta("\n💬 Sua pergunta (ou digite 'sair'): "));

    if (pergunta.toLowerCase() === "sair") {
      console.log(chalk.cyanBright("👋 Até logo! Obrigado pelo contato."));
      break;
    }

    console.log(chalk.gray("\n⏳ Pensando..."));

    try {
      const resposta = await consultarGemini(pergunta, nome);
      console.log(chalk.greenBright("\n🤖 Resposta do ChatBot:\n") + resposta);
    } catch (err) {
      console.error(chalk.red("❌ Erro ao obter resposta do ChatBot: "), err.message);
    }
  }

  rl.close();
}

main().catch(err => {
  console.error(chalk.red("❌ Ocorreu um erro fatal na aplicação:"), err);
  process.exit(1);
});