export enum AppModel {
  LLAMA3_2 = "llama3.2",
  LLAMA3 = "llama3",
  GEMMA2 = "gemma2",
  MISTRAL = "mistral",
  PHI3 = "phi3"
}

export enum AccentTheme {
  LIGHT_GREEN = "light-green",
  LIGHT_BLUE = "light-blue",
  ORANGE = "orange",
  TEAL = "teal"
}

export enum AssistantPersona {
  STUDY_SUPPORT = "study-support",
  CODING_ASSISTANCE = "coding-assistance",
  CAREER_GUIDANCE = "career-guidance",
  GENERAL_CONVERSATION = "general-conversation"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
