/** Demo grade mapping — mirrors typical trigger-style letter grades. */
export function gradeFromMarks(marks: number): string {
  if (marks >= 90) return "A";
  if (marks >= 80) return "B";
  if (marks >= 70) return "C";
  if (marks >= 60) return "D";
  return "F";
}
