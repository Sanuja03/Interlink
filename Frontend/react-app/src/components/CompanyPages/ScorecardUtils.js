

export const GRADE_BANDS = [
    { min: 90, label: "Strong Hire", color: "#16a34a", letter: "A+" },
    { min: 75, label: "Hire",        color: "#2563eb", letter: "A/B+" },
    { min: 60, label: "Hold",        color: "#d97706", letter: "B/C+" },
    { min: 0,  label: "Reject",      color: "#dc2626", letter: "C/D/F" },
  ];
  
  /**
   * Calculate weighted percentage score.
   * @param {Array<{score: number, maxScore: number}>} fieldScores
   * @returns {{ percentage: number, grade: object, totalScore: number, totalMax: number }}
   */

  export const calculateScore = (fieldScores = []) => {
    if (!fieldScores.length) {
      return { percentage: 0, grade: GRADE_BANDS[3], totalScore: 0, totalMax: 0 };
    }
  
    const totalScore = fieldScores.reduce((sum, f) => sum + (Number(f.score) || 0), 0);
    const totalMax = fieldScores.reduce((sum, f) => sum + (Number(f.maxScore) || 0), 0);
  
    if (totalMax === 0) {
      return { percentage: 0, grade: GRADE_BANDS[3], totalScore: 0, totalMax: 0 };
    }
  
    const percentage = Math.round((totalScore / totalMax) * 100);
    const grade = GRADE_BANDS.find((b) => percentage >= b.min) || GRADE_BANDS[3];
  
    return { percentage, grade, totalScore, totalMax };
  };
  
  