// Helper formatting functions for FINORA

export const formatRupiah = (number, withPrefix = true) => {
  if (number === undefined || number === null || isNaN(number)) return withPrefix ? "Rp 0" : "0";
  const formatted = Math.abs(number).toLocaleString("id-ID");
  const prefix = withPrefix ? "Rp " : "";
  const sign = number < 0 ? "- " : "";
  return `${sign}${prefix}${formatted}`;
};

export const formatCompactRupiah = (number) => {
  if (Math.abs(number) >= 1_000_000) {
    const val = (number / 1_000_000).toFixed(1).replace(".0", "");
    return `Rp ${val} jt`;
  }
  if (Math.abs(number) >= 1_000) {
    const val = (number / 1_000).toFixed(0);
    return `Rp ${val} rb`;
  }
  return `Rp ${number}`;
};

export const formatDateIndo = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};
