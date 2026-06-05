import type { StyleQuizStoredResult } from "@/data/types";

export type QuizStyleName =
  | "Scandinavian Outdoor Living"
  | "Mediterranean Escape"
  | "Dark Contemporary"
  | "Family Luxury Garden"
  | "Resort Outdoor Living"
  | "Natural Modern Garden";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type QuizStyleResult = {
  styleName: QuizStyleName;
  matchingBriefStyle: string;
  description: string;
  recommendedFeatures: string[];
  likelyBudgetBand: string;
  bestFor: string[];
};

export const STYLE_QUIZ_STORAGE_KEY = "antheonStyleQuizResult";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "gardenUse",
    question: "How do you imagine using your garden most?",
    options: [
      "Quiet evenings outside",
      "Hosting friends and family",
      "Family time with children",
      "Low-maintenance relaxation",
      "Statement outdoor living",
    ],
  },
  {
    id: "entertaining",
    question: "How often do you entertain outside?",
    options: ["Rarely", "Occasionally", "Often", "As much as possible"],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      "A calm, minimal space",
      "A warm holiday feel",
      "Practical family use",
      "Low-maintenance planting",
      "A dramatic modern look",
      "A premium entertaining space",
    ],
  },
  {
    id: "family",
    question: "Do you have children or pets to consider?",
    options: ["Yes, children", "Yes, pets", "Both", "No", "Not sure yet"],
  },
  {
    id: "visual",
    question: "Which visual direction feels closest?",
    options: [
      "Clean, pale, minimal and calm",
      "Warm, textured, Mediterranean",
      "Dark, architectural and dramatic",
      "Natural, soft and planted",
      "Hotel-style outdoor living",
      "Practical but premium family garden",
    ],
  },
  {
    id: "maintenance",
    question: "How much maintenance do you want?",
    options: [
      "As little as possible",
      "Moderate maintenance is fine",
      "I enjoy planting and greenery",
      "Unsure",
    ],
  },
  {
    id: "budget",
    question: "What level of investment are you considering?",
    options: [
      "Garden Refresh: £3,500–£7,000",
      "Signature Transformation: £7,500–£15,000",
      "Outdoor Living: £15,000–£30,000",
      "Luxury Outdoor Space: £30,000–£60,000+",
      "Not sure yet",
    ],
  },
];

export const quizStyleResults: Record<QuizStyleName, QuizStyleResult> = {
  "Scandinavian Outdoor Living": {
    styleName: "Scandinavian Outdoor Living",
    matchingBriefStyle: "Scandinavian",
    description:
      "A calm, minimal outdoor space built around clean lines, soft planting and low-maintenance materials.",
    recommendedFeatures: ["Pale paving", "Composite-style seating zone", "Soft grasses", "Low lighting"],
    likelyBudgetBand: "Garden Refresh to Outdoor Living",
    bestFor: ["calm", "minimal", "low-maintenance", "pale tones", "clean lines"],
  },
  "Mediterranean Escape": {
    styleName: "Mediterranean Escape",
    matchingBriefStyle: "Mediterranean",
    description:
      "A warm, relaxed garden direction with textured materials, olive/lavender style planting and an easy holiday feel.",
    recommendedFeatures: ["Warm stone", "Dining terrace", "Lavender-style planting", "Pergola if budget allows"],
    likelyBudgetBand: "Signature Transformation to Outdoor Living",
    bestFor: ["warm textures", "holiday feel", "relaxed entertaining", "olive and lavender planting"],
  },
  "Dark Contemporary": {
    styleName: "Dark Contemporary",
    matchingBriefStyle: "Dark modern",
    description:
      "A confident modern garden with charcoal finishes, architectural planting and a strong evening atmosphere.",
    recommendedFeatures: ["Charcoal screening", "Dark patio zone", "Architectural planting", "Warm feature lighting"],
    likelyBudgetBand: "Garden Refresh to Luxury Outdoor Space",
    bestFor: ["dramatic modern look", "charcoal finishes", "architectural lighting", "evening atmosphere"],
  },
  "Family Luxury Garden": {
    styleName: "Family Luxury Garden",
    matchingBriefStyle: "Family-friendly",
    description:
      "A practical but polished garden shaped around children, pets, lawn, seating and durable everyday materials.",
    recommendedFeatures: ["Real lawn", "Seating area", "Storage", "Durable planting"],
    likelyBudgetBand: "Garden Refresh to Outdoor Living",
    bestFor: ["children and pets", "lawn", "practical zones", "durable materials"],
  },
  "Resort Outdoor Living": {
    styleName: "Resort Outdoor Living",
    matchingBriefStyle: "Resort-style",
    description:
      "A premium entertaining direction with generous seating, dining, shelter and a more complete outdoor living feel.",
    recommendedFeatures: ["Pergola", "Outdoor dining", "Fire pit", "Layered lighting"],
    likelyBudgetBand: "Outdoor Living to Luxury Outdoor Space",
    bestFor: ["entertaining", "outdoor dining", "pergola zones", "luxury hosting"],
  },
  "Natural Modern Garden": {
    styleName: "Natural Modern Garden",
    matchingBriefStyle: "Natural planting",
    description:
      "A planting-led direction with grasses, soft boundaries and an organic feel that still stays modern and composed.",
    recommendedFeatures: ["Ornamental grasses", "Soft boundary planting", "Pathway", "Wildlife-friendly planting"],
    likelyBudgetBand: "Garden Refresh to Signature Transformation",
    bestFor: ["planting-led design", "grasses", "soft boundaries", "wildlife-friendly feel"],
  },
};

const scoring: Record<string, Record<string, Partial<Record<QuizStyleName, number>>>> = {
  gardenUse: {
    "Quiet evenings outside": { "Scandinavian Outdoor Living": 2, "Natural Modern Garden": 1 },
    "Hosting friends and family": { "Resort Outdoor Living": 2, "Mediterranean Escape": 1 },
    "Family time with children": { "Family Luxury Garden": 3 },
    "Low-maintenance relaxation": { "Scandinavian Outdoor Living": 2, "Dark Contemporary": 1 },
    "Statement outdoor living": { "Dark Contemporary": 2, "Resort Outdoor Living": 2 },
  },
  entertaining: {
    Rarely: { "Scandinavian Outdoor Living": 1, "Natural Modern Garden": 1 },
    Occasionally: { "Mediterranean Escape": 1, "Family Luxury Garden": 1 },
    Often: { "Resort Outdoor Living": 2, "Mediterranean Escape": 1 },
    "As much as possible": { "Resort Outdoor Living": 3, "Dark Contemporary": 1 },
  },
  priority: {
    "A calm, minimal space": { "Scandinavian Outdoor Living": 3 },
    "A warm holiday feel": { "Mediterranean Escape": 3 },
    "Practical family use": { "Family Luxury Garden": 3 },
    "Low-maintenance planting": { "Natural Modern Garden": 2, "Scandinavian Outdoor Living": 1 },
    "A dramatic modern look": { "Dark Contemporary": 3 },
    "A premium entertaining space": { "Resort Outdoor Living": 3 },
  },
  family: {
    "Yes, children": { "Family Luxury Garden": 3 },
    "Yes, pets": { "Family Luxury Garden": 2, "Natural Modern Garden": 1 },
    Both: { "Family Luxury Garden": 4 },
    No: { "Scandinavian Outdoor Living": 1, "Dark Contemporary": 1, "Resort Outdoor Living": 1 },
    "Not sure yet": { "Family Luxury Garden": 1 },
  },
  visual: {
    "Clean, pale, minimal and calm": { "Scandinavian Outdoor Living": 4 },
    "Warm, textured, Mediterranean": { "Mediterranean Escape": 4 },
    "Dark, architectural and dramatic": { "Dark Contemporary": 4 },
    "Natural, soft and planted": { "Natural Modern Garden": 4 },
    "Hotel-style outdoor living": { "Resort Outdoor Living": 4 },
    "Practical but premium family garden": { "Family Luxury Garden": 4 },
  },
  maintenance: {
    "As little as possible": { "Scandinavian Outdoor Living": 2, "Dark Contemporary": 1 },
    "Moderate maintenance is fine": { "Mediterranean Escape": 1, "Family Luxury Garden": 1 },
    "I enjoy planting and greenery": { "Natural Modern Garden": 3, "Mediterranean Escape": 1 },
    Unsure: { "Scandinavian Outdoor Living": 1, "Natural Modern Garden": 1 },
  },
  budget: {
    "Garden Refresh: £3,500–£7,000": {
      "Scandinavian Outdoor Living": 2,
      "Dark Contemporary": 1,
      "Natural Modern Garden": 2,
      "Family Luxury Garden": 1,
    },
    "Signature Transformation: £7,500–£15,000": {
      "Mediterranean Escape": 1,
      "Family Luxury Garden": 1,
      "Natural Modern Garden": 1,
    },
    "Outdoor Living: £15,000–£30,000": {
      "Resort Outdoor Living": 2,
      "Mediterranean Escape": 1,
      "Dark Contemporary": 1,
    },
    "Luxury Outdoor Space: £30,000–£60,000+": {
      "Resort Outdoor Living": 3,
      "Dark Contemporary": 2,
    },
    "Not sure yet": {
      "Scandinavian Outdoor Living": 1,
      "Natural Modern Garden": 1,
    },
  },
};

export function calculateStyleQuizResult(answers: Record<string, string>): StyleQuizStoredResult {
  const scores = initialiseScores();

  Object.entries(answers).forEach(([questionId, answer]) => {
    const weights = scoring[questionId]?.[answer] ?? {};

    Object.entries(weights).forEach(([styleName, value]) => {
      scores[styleName as QuizStyleName] += value ?? 0;
    });
  });

  const styleName = (Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "Scandinavian Outdoor Living") as QuizStyleName;
  const result = quizStyleResults[styleName];

  return {
    styleName,
    matchingBriefStyle: result.matchingBriefStyle,
    budgetBand: answers.budget ?? "",
    answers,
    recommendedFeatures: result.recommendedFeatures,
    whyThisSuitsYou: buildWhyThisSuitsYou(result, answers),
    timestamp: new Date().toISOString(),
  };
}

export function getQuizResultDetails(styleName: string) {
  return quizStyleResults[styleName as QuizStyleName] ?? quizStyleResults["Scandinavian Outdoor Living"];
}

export function saveStyleQuizResult(result: StyleQuizStoredResult) {
  window.localStorage.setItem(STYLE_QUIZ_STORAGE_KEY, JSON.stringify(result));
}

export function loadStyleQuizResult() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STYLE_QUIZ_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StyleQuizStoredResult) : null;
  } catch {
    return null;
  }
}

function initialiseScores() {
  return Object.keys(quizStyleResults).reduce<Record<QuizStyleName, number>>((scores, styleName) => {
    scores[styleName as QuizStyleName] = 0;
    return scores;
  }, {} as Record<QuizStyleName, number>);
}

function buildWhyThisSuitsYou(
  result: QuizStyleResult,
  answers: Record<string, string>,
) {
  return [
    `Your answers point toward ${result.bestFor.slice(0, 3).join(", ")}.`,
    answers.budget
      ? `Your selected investment level was ${answers.budget}, so the direction can be shaped with budget realism in mind.`
      : "Your investment level can be refined during the garden brief.",
    "The final direction will still depend on layout, photos, access and consultation.",
  ];
}
