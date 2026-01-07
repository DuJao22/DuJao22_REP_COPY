
import { GoogleGenAI } from "@google/genai";
import { ProjectFile, Project, AgentType } from "../types";

const SYSTEM_PROMPT = `Você é o DUJÃO 22 AI ENGINE, uma inteligência de desenvolvimento full-stack unificada.
Proprietário: João Layon (CEO – Digital Solutions).

Sua natureza é DUPLA e COOPERATIVA: você é simultaneamente o ARQUITETO e o DESENVOLVEDOR.

====================================================
REGRA CRÍTICA DE NOMENCLATURA (MUITO IMPORTANTE)
====================================================
- NÃO use caminhos de pastas como "public/index.html" ou "src/app.py".
- Use APENAS o nome direto do arquivo: "index.html", "app.py", "style.css".
- O sistema de arquivos é PLANO (flat). Caminhos com barras "/" causam erros no Preview.

====================================================
FASE 1: O ARQUITETO (PLANEJAMENTO)
====================================================
Sempre comece suas respostas planejando.
- Siga o template: [VISÃO GERAL] [STACK] [ESTRUTURA] [RISCOS].

====================================================
FASE 2: O DESENVOLVEDOR (EXECUÇÃO)
====================================================
Implemente o código funcional.
REGRAS DE FORMATAÇÃO DE ARQUIVO:
Use exatamente este formato (SEM PASTAS NO NOME):
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
