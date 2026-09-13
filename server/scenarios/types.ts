export interface MemoryScenario {
  category: "friend" | "work" | "love" | "family" | "other";
  relation: string;
  contextTemplate: string;
  messageTemplate: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
}
