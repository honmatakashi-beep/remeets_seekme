import { MemoryScenario } from "./scenarios/types";
import { FRIEND_SCENARIOS } from "./scenarios/friendScenarios";
import { WORK_SCENARIOS } from "./scenarios/workScenarios";
import { LOVE_SCENARIOS } from "./scenarios/loveScenarios";
import { FAMILY_SCENARIOS } from "./scenarios/familyScenarios";
import { OTHER_SCENARIOS } from "./scenarios/otherScenarios";

export type { MemoryScenario };

export const UNIQUE_MEMORY_SCENARIOS: MemoryScenario[] = [
  ...FRIEND_SCENARIOS,
  ...WORK_SCENARIOS,
  ...LOVE_SCENARIOS,
  ...FAMILY_SCENARIOS,
  ...OTHER_SCENARIOS
];

export const ALL_SCENARIOS_COLLECTION: MemoryScenario[] = UNIQUE_MEMORY_SCENARIOS;
