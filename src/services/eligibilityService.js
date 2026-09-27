function calculateAgeCategory(birthDateString) {
  const birthDate = new Date(birthDateString);
  const currentYear = new Date().getFullYear();

  const cutoffDate = new Date(currentYear, 11, 31);

  let age = cutoffDate.getFullYear() - birthDate.getFullYear();

  if (age < 6) return "Éveil / Baby-Sport";
  if (age <= 8) return "Poussin (U9)";
  if (age <= 10) return "Benjamin (U11)";
  if (age <= 12) return "Minime (U13)";
  if (age <= 14) return "Cadet (U15)";
  if (age <= 17) return "Junior (U18)";
  if (age <= 39) return "Senior";
  return "Vétéran / Master";
}

function verifyAgeEligibility(memberAgeCategory, activityAgeCategory) {
  if (activityAgeCategory === "Tous publics") return true;
  return memberAgeCategory === activityAgeCategory;
}

function checkMedicalCompliance(certificateDateString, activityName) {
  if (!certificateDateString) return "medical_non_compliant";

  const certDate = new Date(certificateDateString);
  const currentDate = new Date();

  const diffTime = Math.abs(currentDate - certDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

  const highRiskSports = ["Boxe", "Plongée sous-marine", "Rugby"];
  const isHighRisk = highRiskSports.some((sport) =>
    activityName.toLowerCase().includes(sport.toLowerCase()),
  );

  if (isHighRisk && diffYears > 1) {
    return "medical_non_compliant";
  }

  if (!isHighRisk && diffYears > 3) {
    return "medical_non_compliant";
  }

  return "compliant";
}

module.exports = {
  calculateAgeCategory,
  verifyAgeEligibility,
  checkMedicalCompliance,
};
