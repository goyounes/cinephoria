function validateCardExpiryDate (value){
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return { valid: false, reason: "invalid_format" };
  }

  const [inputMonth, inputYear] = value.split("/").map(Number);
  if (inputMonth < 1 || inputMonth > 12) {
    return { valid: false, reason: "invalid_format" };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // last two digits of year
  const currentMonth = currentDate.getMonth() + 1; // 1-based month

  if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
};

export default validateCardExpiryDate