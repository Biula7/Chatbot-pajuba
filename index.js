// index.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fetch from "node-fetch";
import chalk from "chalk";
import figlet from "figlet";


// ====== CONFIGURAÇÕES ======
const ai = new GoogleGenerativeAI({ apiKey: "AIzaSyChzFz6KTBFwVzQ6FKccfOm8nWFoPdwdwc" }); // Substitua pela sua chave da API do Gemini
const OPENWEATHER_API_KEY = "745ea822e2c0c593da1a8518182fcaae"; // Substitua pela sua chave da OpenWeather

// ====== Função para obter clima atual ======
async function obterClima(cidade) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) return "Desculpe, não consegui encontrar essa cidade.";

    const temp = data.main.temp;
    const condicao = data.weather[0].description;
    let recomendacao = "";

    if (temp < 15) recomendacao = "Está frio, leve um casaco!";
    else if (temp > 30) recomendacao = "Muito calor! Hidrate-se bem!";
    else recomendacao = "Temperatura agradável, aproveite o dia!";

    return `Em ${cidade}, agora está ${temp}°C com ${condicao}. ${recomendacao}`;
  } catch (erro) {
    return "Erro ao buscar a previsão do tempo.";
  }
}

// ====== Função para saber data e hora ======
function obterDataHora() {
  const agora = new Date();
  const opcoes = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const data = agora.toLocaleDateString("pt-BR", opcoes);
  const hora = agora.toLocaleTimeString("pt-BR");
  return `🗓️ Hoje é ${data}, e agora são ${hora}.`;
}

// ====== Função para consultar o Gemini ======
async function consultarGemini(mensagem) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(mensagem);
    const response = await result.response;
    return response.text();
  } catch (erro) {
    return "❌ Erro ao consultar Gemini.";
  }
}

// ====== Função principal ======
async function main() {
  const rl = readline.createInterface({ input, output });

  console.log(
  chalk.cyan(
    figlet.textSync("ChatBot Funcional", {
      font: "Standard", // Você pode trocar o estilo aqui (ex: 'Ghost', 'Slant', 'Big', etc)
      horizontalLayout: "default",
      verticalLayout: "default"
    })
  )
);
  const nome = await rl.question("Qual é o seu nome? ");
  const humor = await rl.question("Como você está se sentindo hoje? ");

  console.log(`\n😎 Olá, ${chalk.green.bold(nome)}! Você está se sentindo ${chalk.yellow(humor)} hoje.`);
  console.log(chalk.magenta("\nVocê pode digitar perguntas. Para sair, digite 'sair'.\n"));

  while (true) {
    const pergunta = await rl.question("🤖 Sua pergunta: ");

    if (pergunta.trim().toLowerCase() === "sair") {
      console.log(chalk.blueBright("\n👋 Até logo!"));
      break;
    }

    console.log(chalk.gray("\n📨 Processando sua pergunta...\n"));

    // Pergunta sobre o tempo
    if (pergunta.toLowerCase().includes("clima") || pergunta.toLowerCase().includes("tempo")) {
      const cidade = pergunta.split("em")[1]?.trim() || "São Paulo";
      const clima = await obterClima(cidade);
      console.log(chalk.cyan(`🌦️ ${clima}\n`));
    }

    // Pergunta sobre hora/data
    else if (pergunta.toLowerCase().includes("hora") || pergunta.toLowerCase().includes("data")) {
      const dataHora = obterDataHora();
      console.log(chalk.yellow(`\n⏰ Resposta com data e hora:\n${dataHora}\n`));
    }

    // Outras perguntas: vão para o Gemini
    else {
      const mensagem = `Usuário ${nome} está se sentindo ${humor}. Ele perguntou: "${pergunta}"`;
      const resposta = await consultarGemini(mensagem);
      console.log(chalk.green(`💬 Resposta:\n${resposta}\n`));
    }
  }

  rl.close();
}

main();
