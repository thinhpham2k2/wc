import { FootballApiMatch } from "@/types";

const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";

const fetchApi = async (endpoint: string): Promise<unknown> => {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    "X-Auth-Token": API_KEY,
  };

  const response = await fetch(url, {
    headers,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Lấy tất cả trận World Cup
export const fetchAllMatches = async (): Promise<FootballApiMatch[]> => {
  const data = await fetchApi("/competitions/WC/matches") as { matches: FootballApiMatch[] };
  return data.matches;
};

// Lấy trận đã kết thúc
export const fetchFinishedMatches = async (): Promise<FootballApiMatch[]> => {
  const data = await fetchApi("/competitions/WC/matches?status=FINISHED") as { matches: FootballApiMatch[] };
  return data.matches;
};

// Lấy trận đang diễn ra
export const fetchLiveMatches = async (): Promise<FootballApiMatch[]> => {
  const data = await fetchApi("/competitions/WC/matches?status=IN_PLAY") as { matches: FootballApiMatch[] };
  return data.matches;
};

// Lấy trận scheduled
export const fetchScheduledMatches = async (): Promise<FootballApiMatch[]> => {
  const data = await fetchApi("/competitions/WC/matches?status=SCHEDULED,TIMED") as { matches: FootballApiMatch[] };
  return data.matches;
};
