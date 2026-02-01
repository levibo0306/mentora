// apps/backend/src/services/ai.ts

export interface GeneratedQuestion {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export async function generateQuizFromText(textContext: string, count: number = 5): Promise<GeneratedQuestion[]> {
  // TODO: Itt küldd el a teljes szöveget az LLM-nek ezzel a prompttal:
  // "Create 5 multiple choice questions based ONLY on the following text: ${textContext}..."
  
  console.log("Generating questions from text length:", textContext.length);
  
  // Mock válasz (demonstrációhoz, amíg nincs OpenAI kulcsod bekötve)
  return [
    {
      prompt: "Miről szólt a feltöltött szöveg első bekezdése?",
      options: ["Az AI-ról", "A történelemről", "A biológiáról", "Semmiről"],
      correct_index: 0,
      explanation: "A szöveg elemzése alapján ez a helyes."
    },
    // ... több kérdés
  ];
}