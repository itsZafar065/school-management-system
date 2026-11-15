// Pakistani Office Formats: PKR, DD/MM/YYYY, CNIC, Phone

export function formatPKR(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(num)) return "Rs. 0";
  return `Rs. ${num.toLocaleString("en-PK")}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  // If in YYYY-MM-DD
  if (dateStr.includes("-")) {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateStr;
}

export function formatCNIC(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

export function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
}

export function isValidCNIC(val: string): boolean {
  return /^\d{5}-\d{7}-\d{1}$/.test(val);
}

export function isValidPhone(val: string): boolean {
  return /^03\d{2}-\d{7}$/.test(val);
}
