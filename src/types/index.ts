export interface UserPayload {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface MatchData {
  id: string;
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  kickoffTime: string;
  allowDraw: boolean;
  scoreA: number | null;
  scoreB: number | null;
  penaltyA: number | null;
  penaltyB: number | null;
  isCompleted: boolean;
  externalId: number | null;
  stage: string | null;
  group: string | null;
}

export interface PredictionData {
  id: string;
  userId: string;
  matchId: string;
  predictedScoreA: number;
  predictedScoreB: number;
  points: number | null;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  correctResults: number;
  exactScores: number;
  totalPredictions: number;
}

export interface FootballApiMatch {
  id: number;
  utcDate: string;
  status: string;
  minute: number | null;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner: string | null;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    penalties: {
      home: number | null;
      away: number | null;
    } | null;
  };
}
