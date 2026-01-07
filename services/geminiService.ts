
import { GoogleGenAI } from "@google/genai";
import { ProjectFile, Project, AgentType } from "../types";

const SYSTEM_PROMPT = `Você é o DUJÃO 22 AI ENGINE, uma inteligência de desenvolvimento full-stack unificada.
Proprietário: João Layon (CEO – Digital Solutions).

Sua natureza é DUPLA e COOPERATIVA: você é simultaneamente o ARQUITETO e o DESENVOLVEDOR.

====================================================
REGRA CRÍTICA DE NOMENCLATURA E ESTRUTURA
====================================================
- O sistema de arquivos é PLANO (flat). NÃO use caminhos como "src/index.js". Use apenas "index.js".
- SEMPRE inclua um arquivo "index.html" robusto como ponto de entrada.
- Garanta que todos os arquivos (CSS, JS) sejam referenciados corretamente via caminhos relativos: <link href="style.css">, <script src="script.js">.

====================================================
PREVENÇÃO DE "TELA ESCURA" NO DEPLOY
====================================================
- Se estiver criando um site HTML/JS, certifique-se de que o JS não depende de arquivos que você não criou.
- Sempre adicione um conteúdo visível inicial no HTML para que o usuário saiba que carregou.
- Se usar React via ESM (scripts tipo module), certifique-se de importar de URLs CDN (como esm.sh).

====================================================
FASE 1: O ARQUITETO (PLANEJAMENTO)
====================================================
Sempre comece suas respostas planejando.
- Siga o template: [VISÃO GERAL] [STACK] [ESTRUTURA] [RISCOS].

====================================================
FASE 2: O DESENVOLVEDOR (EXECUÇÃO)
====================================================
Implemente o código funcional.
Use exatamente este formato:
@@@FILE:nome_do_arquivo.ext@@@
CONTEÚDO COMPLETO
@@@ENDFILE@@@`;

export async function askAI(prompt: string, project: Project | null, agent?: AgentType) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  let context = "Nenhum projeto ativo. Inicie um novo planejamento e implementação.";
  if (project) {
    const filesContext = Object.values(project.files)
      .map((f: ProjectFile) => `ARQUIVO: ${f.name}\nLinguagem: ${f.language}\nCONTEÚDO:\n${f.content}`)
      .join('\n\n---\n\n');
    context = `PROJETO NO WORKSPACE: ${project.name}\nDESCRIÇÃO: ${project.description}\n\nARQUIVOS ATUAIS:\n${filesContext}`;
  }

  let specializedInstruction = SYSTEM_PROMPT;
  if (agent === 'architect') {
    specializedInstruction += "\n\nFOCO ATUAL: ARQUITETO (Planejamento e Estrutura).";
  } else if (agent === 'developer') {
    specializedInstruction += "\n\nFOCO ATUAL: DESENVOLVEDOR (Código e Correção).";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `
CONTEXTO DO AMBIENTE:
${context}

SOLICITAÇÃO DO USUÁRIO / REQUISITO:
${prompt}`,
      config: {
        systemInstruction: specializedInstruction,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 16384 }
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("AI Engine Error:", error);
    return "Erro crítico no Dujão AI Engine. Tente reiniciar a solicitação.";
  }
}
