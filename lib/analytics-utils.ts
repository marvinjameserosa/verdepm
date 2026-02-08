export function calculateTrend(data: number[]): {
  slope: number;
  intercept: number;
} {
  if (data.length < 2) return { slope: 0, intercept: 0 };

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function calculateMoM(current: number, previous: number): number {
  if (previous === 0) return 0; // Avoid division by zero
  return ((current - previous) / previous) * 100;
}

export function calculateIntensity(
  emissions: number,
  manHours: number
): number {
  if (manHours === 0) return 0;
  return emissions / manHours;
}
