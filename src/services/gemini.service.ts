import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

export interface AIContext {
  genre?: string;
  setting?: string;
  magicSystem?: string;
  tone?: string;
}

// Instruções de sistema persistentes para definir a personalidade do autor
const SYSTEM_INSTRUCTION = `
VOCÊ É: Um romancista literário premiado e sofisticado.
SEU OBJETIVO: Escrever prosa que seja indistinguível de um autor humano talentoso.

REGRAS DE ESTILO (INEGOCIÁVEIS):
1. **Show, Don't Tell (Mostre, Não Conte):**
   - NUNCA diga: "Ele ficou com medo."
   - DIGA: "O suor gelou em sua nuca; suas mãos tremeram, derrubando a xícara."
   - Priorize texturas, cheiros, sons e sensações físicas sobre explicações abstratas.

2. **Proibição de Clichês de IA:**
   - ESTRITAMENTE PROIBIDO usar: "mal sabia ele", "uma mistura de emoções", "sentiu um calafrio na espinha", "tudo mudou", "no fundo de sua alma", "um silêncio ensurdecedor".
   - Evite conclusões moralistas ou resumos no final de cenas.

3. **Ritmo e Cadência:**
   - A marca de texto robótico é a monotonia. QUEBRE o ritmo.
   - Use frases fragmentadas. Use orações longas e complexas.
   - Evite começar parágrafos repetidamente com O nome do personagem ou "Ele/Ela".

4. **Profundidade Psicológica:**
   - Foque na inconsistência humana. Personagens pensam uma coisa e fazem outra.
   - Use monólogos internos que pareçam pensamentos reais (caóticos), não explicações de enredo.
`;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  constructor() {
    this.init();
  }

  private init() {
    const apiKey = process.env['API_KEY'];
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('API_KEY is missing. AI features will be disabled.');
    }
  }

  async generateSuggestion(
    chapterSummary: string, 
    currentText: string, 
    type: string = 'generic', 
    context?: AIContext,
    feedback?: string
  ): Promise<string> {
    if (!this.ai) throw new Error('AI not initialized');

    const bookContext = this.buildContextString(context);
    
    const feedbackPrompt = feedback 
      ? `\nCRITICAL REVISION INSTRUCTION: O usuário rejeitou a versão anterior. Ajuste estritamente seguindo: "${feedback}"` 
      : '';

    const prompt = `
      CONTEXTO DO PROJETO:
      ${bookContext}
      
      RESUMO DO CAPÍTULO:
      "${chapterSummary}"
      
      CENA ATUAL (O QUE JÁ FOI ESCRITO):
      "${currentText.slice(-2000)}" 

      TAREFA:
      Escreva uma continuação imediata (aprox. 300-500 palavras) do tipo: "${type}".
      ${feedbackPrompt}
      
      IMPORTANTE:
      - Mantenha o tom: ${context?.tone || 'Literário'}.
      - Continue a ação exatamente de onde parou.
      - NÃO faça preâmbulos. Apenas o texto da história.
      
      SEED DE VARIAÇÃO: ${Date.now()}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9, 
          topK: 40,
          topP: 0.95
        }
      });
      return response.text || '';
    } catch (error) {
      console.error('Gemini Error:', error);
      throw error;
    }
  }

  async generateChapterDraft(
    chapterTitle: string, 
    chapterSummary: string, 
    context?: AIContext,
    targetWordCount: number = 1000,
    feedback?: string
  ): Promise<string> {
    if (!this.ai) throw new Error('AI not initialized');

    const bookContext = this.buildContextString(context);

    const feedbackPrompt = feedback 
      ? `\n*** PEDIDO DE REVISÃO ***\nReescreva completamente o texto anterior considerando este feedback: "${feedback}".\n` 
      : '\n*** INSTRUÇÃO DE CRIAÇÃO ***\nEscreva uma versão criativa e única desta cena.\n';

    const prompt = `
      CONTEXTO DO LIVRO:
      ${bookContext}
      
      CAPÍTULO PARA ESCREVER:
      Título: ${chapterTitle}
      Resumo/Guia: ${chapterSummary}
      
      TAREFA:
      Escreva o rascunho completo desta cena/capítulo.
      Alvo de palavras: ~${targetWordCount}.
      
      ${feedbackPrompt}
      
      DIRETRIZES ESPECÍFICAS:
      - Mergulhe direto na cena ("In media res").
      - Use diálogos com subtexto.
      - Evite linguagem genérica.
      
      NONCE DE VARIAÇÃO: ${Math.random()} (Ignore isso, serve apenas para garantir nova geração)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.95, // Aumentado para garantir variedade
          topK: 40,
          topP: 0.95
        }
      });
      return response.text || '';
    } catch (error) {
      console.error('Gemini Draft Error:', error);
      throw error;
    }
  }

  private buildContextString(context?: AIContext): string {
    if (!context) return 'Contexto padrão.';
    return `
      Gênero: ${context.genre || 'Ficção Literária'}
      Cenário: ${context.setting || 'Contemporâneo'}
      Tom: ${context.tone || 'Realista'}
      ${context.magicSystem ? `Sistema de Magia/Tech: ${context.magicSystem}` : ''}
    `;
  }
}