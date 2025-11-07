/**
 * User profile types for the matching engine
 */

export interface Skill {
  id: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  languages: string[]; // e.g., ['en', 'es', 'fr']
  offers: Skill[]; // Skills the user can teach
  wants: Skill[]; // Skills the user wants to learn
  trustScore: number; // 0-1 scale
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchScore {
  totalScore: number;
  semanticScoreAtoB: number; // A's offer → B's want
  semanticScoreBtoA: number; // B's offer → A's want
  languageScore: number;
  trustScore: number;
  breakdown: {
    w1: number; // weight for semanticScoreAtoB
    w2: number; // weight for semanticScoreBtoA
    w3: number; // weight for languageScore
    w4: number; // weight for trustScore
  };
}

export interface MatchResult {
  userA: UserProfile;
  userB: UserProfile;
  matchScore: MatchScore;
  matchedAt: Date;
}

export interface MatchingWeights {
  w1: number; // Semantic similarity: A's offer → B's want
  w2: number; // Semantic similarity: B's offer → A's want
  w3: number; // Language similarity
  w4: number; // Trust score
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  w1: 0.35, // Primary match direction
  w2: 0.35, // Reverse match direction
  w3: 0.15, // Language compatibility
  w4: 0.15, // Trust/reliability
};

