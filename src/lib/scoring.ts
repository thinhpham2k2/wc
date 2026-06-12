export const calculatePoints = (
  predictedScoreA: number,
  predictedScoreB: number,
  actualScoreA: number,
  actualScoreB: number
): number => {
  // Đúng tỉ số chính xác → 3 điểm
  if (predictedScoreA === actualScoreA && predictedScoreB === actualScoreB) {
    return 3;
  }

  // Đúng kết quả (thắng/thua/hòa) → 1 điểm
  const predictedResult = Math.sign(predictedScoreA - predictedScoreB);
  const actualResult = Math.sign(actualScoreA - actualScoreB);

  if (predictedResult === actualResult) {
    return 1;
  }

  // Sai → 0 điểm
  return 0;
};
