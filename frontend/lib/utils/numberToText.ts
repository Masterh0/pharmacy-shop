// 🔠 تبدیل عدد به حروف فارسی با واحد "تومان"
export function numberToPersianText(numStr: string): string {
  if (!numStr) return "";
  const raw = numStr.replace(/,/g, "");
  const num = parseInt(raw, 10);
  if (isNaN(num) || num === 0) return "صفر تومان";

  const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
  const teens = [
    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده",
  ];
  const tens = [
    "",
    "",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود",
  ];
  const hundreds = [
    "",
    "صد",
    "دویست",
    "سیصد",
    "چهارصد",
    "پانصد",
    "ششصد",
    "هفتصد",
    "هشتصد",
    "نهصد",
  ];
  const units = ["", "هزار", "میلیون", "میلیارد"];

  const convertChunk = (n: number): string => {
    if (n === 0) return "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    const parts: string[] = [];

    if (h) parts.push(hundreds[h]);

    if (t === 1) {
      parts.push(teens[o]);
    } else if (t > 1) {
      parts.push(tens[t] + (o ? " و " + ones[o] : ""));
    } else if (o > 0) {
      parts.push(ones[o]);
    }

    return parts.filter(Boolean).join(" و ");
  };

  const chunks: string[] = [];
  let div = num,
    i = 0;
  while (div > 0) {
    const part = div % 1000;
    if (part > 0) {
      const text = convertChunk(part);
      const unit = units[i] ? " " + units[i] : "";
      chunks.unshift(text + unit);
    }
    div = Math.floor(div / 1000);
    i++;
  }

  return chunks.join(" و ") + " تومان";
}
