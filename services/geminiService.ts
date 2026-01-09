
import { GoogleGenAI } from "@google/genai";
import { ProjectFile, Project, AgentType } from "../types";

const SYSTEM_PROMPT = `Você é o DUJÃO 22 ULTRA ENGINE, o engenheiro mais sênior da Digital Solutions.
DIRETRIZES DE ENGENHARIA CRÍTICA:
1. NÃO GERE CÓDIGO PARCIAL. Se o usuário pedir um E-commerce, você deve entregar o sistema COMPLETO (Admin, Catálogo, Carrinho, Checkout, API Fake).
2. ESTRUTURA DE PASTAS OBRIGATÓRIA:
   - templates/index.html (Contém o HTML/CSS/JS unificado para visualização instantânea).
   - src/ (Lógica complementar).
   - api/ (Endpoints e lógica de servidor).
   - public/ (Assets).
3. FUNCIONALIDADE TOTAL: O sistema deve rodar sem erros. Use <script src="https://cdn.tailwindcss.com"></script> sempre no HTML.
4. NENHUM "TODO": É proibido usar comentários de "implemente aqui". Todo o código deve estar escrito.

FORMATO DE RESPOSTA:
@@@FILE:caminho/do/arquivo.ext@@@
CÓDIGO COMPLETO
@@@ENDFILE@@@

VERIFICAÇÃO: Ao final, confirme que a estrutura de pastas está correta e que o sistema foi auditado.`;

export async function askAI(prompt: string, project: Project | null, agent: AgentType = 'developer') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  let context = "Iniciando solução Enterprise de ponta a ponta.";
  if (project) {
    const filesContext = Object.values(project.files)
      .map((f: ProjectFile) => `PATH: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');
    context = `SISTEMA ATUAL:\n${project.name}\nARQUIVOS:\n${filesContext}`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `SOLICITAÇÃO: ${prompt}\n\n${context}\n\nLembre-se: Crie a estrutura completa com a pasta templates/ e sistema 100% funcional.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("Critical AI Failure:", error);
    return "FALHA NO NÚCLEO: O cluster de arquitetura não respondeu.";
  }
}
