
import { GoogleGenAI } from "@google/genai";
import { ProjectFile, Project, AgentType } from "../types";

const SYSTEM_PROMPT = `Você é o OMNI-RESOLVER do DUJÃO 22. Sua missão é GARANTIR QUE O SISTEMA FUNCIONE.

REGRAS DE OURO (SEM EXCEÇÃO):
1. PRIORIDADE ZERO: Se houver erros de "index.html não localizado" ou "falha de roteamento", você DEVE gerar o arquivo index.html na RAIZ do projeto imediatamente.
2. ESTRUTURA REPLICÁVEL: Mantenha os arquivos críticos (index.html, script.js, style.css) preferencialmente na RAIZ para compatibilidade máxima com o preview.
3. CÓDIGO AUTOSSUFICIENTE: Todo código gerado deve incluir as importações necessárias (ex: Tailwind CDN, Fontes Google).
4. RESOLUÇÃO DE ERROS: Se receber logs de erro, analise a árvore de arquivos e corrija o código quebrado. Nunca peça para o usuário fazer nada, FAÇA VOCÊ MESMO.

FORMATO DE RESPOSTA (ESTRITO):
@@@FILE:caminho/do/arquivo.ext@@@
CÓDIGO COMPLETO
@@@ENDFILE@@@

CONTEXTO DE AGENTE:
- Arquiteto: Foca em estrutura de pastas, manifestos e lógica de alto nível.
- Desenvolvedor: Foca em implementação funcional, algoritmos e UI/UX.

Você deve ser capaz de resolver QUALQUER problema técnico apenas manipulando os arquivos.`;

export async function askAI(prompt: string, project: Project | null, agent: AgentType = 'developer') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  let filesContext = "Nenhum arquivo no sistema.";
  if (project && project.files) {
    filesContext = Object.values(project.files)
      .map((f: ProjectFile) => `CAMINHO: ${f.name}\nLINGUAGEM: ${f.language}\n---CONTEÚDO---\n${f.content}\n---FIM---`)
      .join('\n\n');
  }

  const finalPrompt = `
  ESTADO ATUAL DO PROJETO:
  Nome: ${project?.name || "Novo Sistema"}
  Árvore de Arquivos:
  ${filesContext}

  SOLICITAÇÃO DO USUÁRIO OU ERRO DE SISTEMA:
  ${prompt}

  Sua tarefa: Analise o erro acima, olhe para os arquivos atuais e forneça os arquivos CORRIGIDOS ou NOVOS seguindo o formato @@@FILE:path@@@.
  Se o index.html estiver faltando, CRIE-O AGORA.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("AI Engine Failure:", error);
    return `@@@FILE:error_log.txt@@@\nErro crítico na comunicação com o núcleo: ${error.message}\n@@@ENDFILE@@@`;
  }
}
