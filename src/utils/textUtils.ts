import * as fuzz from 'fuzzball';
import { extractValuesWithAI } from '../services/aiExtractService';

// Hàm chuẩn hóa text
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
    .trim();
}

// Hàm tách câu
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function compareTexts(text1: string, text2: string): number {
  // Tách thành các câu
  const sentences1 = splitSentences(text1);
  const sentences2 = splitSentences(text2);

  // Nếu không có câu nào, trả về 0
  if (sentences1.length === 0 || sentences2.length === 0) {
    return 0;
  }

  // So sánh từng câu và tính điểm trung bình
  let totalScore = 0;
  let comparedSentences = 0;

  sentences1.forEach((s1) => {
    const normalizedS1 = normalizeText(s1);

    // Tìm câu tương đồng nhất từ text2
    let maxScore = 0;
    sentences2.forEach((s2) => {
      const normalizedS2 = normalizeText(s2);

      // Sử dụng nhiều phương pháp so sánh và lấy điểm cao nhất
      const simpleRatio = fuzz.ratio(normalizedS1, normalizedS2);
      const tokenRatio = fuzz.token_sort_ratio(normalizedS1, normalizedS2);
      const setRatio = fuzz.token_set_ratio(normalizedS1, normalizedS2);
      const partialRatio = fuzz.partial_ratio(normalizedS1, normalizedS2);

      // Tính điểm trung bình có trọng số
      const score =
        (simpleRatio * 0.3 + tokenRatio * 0.3 + setRatio * 0.2 + partialRatio * 0.2) / 100;
      maxScore = Math.max(maxScore, score);
    });

    if (normalizedS1.length > 0) {
      totalScore += maxScore;
      comparedSentences++;
    }
  });

  // Trả về điểm trung bình
  return comparedSentences > 0 ? totalScore / comparedSentences : 0;
}

export function extractKeywords(text: string): string[] {
  // Extract words between {{ and }}
  const regex = /{{(.*?)}}/g;
  const matches = text.match(regex);

  if (!matches) return [];

  return matches.map((match) => match.slice(2, -2).trim());
}

interface ComparisonResult {
  key: string;
  originalValue: string;
  ttsValue: string;
  match: boolean;
  similarity: number;
}

function compareValues(value1: string, value2: string): { match: boolean; similarity: number } {
  const normalizedValue1 = normalizeText(value1);
  const normalizedValue2 = normalizeText(value2);

  // Sử dụng nhiều phương pháp so sánh và tính điểm trung bình có trọng số
  const simpleRatio = fuzz.ratio(normalizedValue1, normalizedValue2);
  const tokenRatio = fuzz.token_sort_ratio(normalizedValue1, normalizedValue2);
  const setRatio = fuzz.token_set_ratio(normalizedValue1, normalizedValue2);
  const partialRatio = fuzz.partial_ratio(normalizedValue1, normalizedValue2);

  // Tính điểm similarity với trọng số cho từng phương pháp
  const similarity =
    (simpleRatio * 0.3 + // Độ giống nhau đơn giản (30%)
      tokenRatio * 0.3 + // So sánh sau khi sắp xếp từ (30%)
      setRatio * 0.2 + // So sánh tập hợp các từ (20%)
      partialRatio * 0.2) / // So sánh một phần (20%)
    100;

  return {
    match: similarity >= 0.9, // Match khi similarity >= 90%
    similarity,
  };
}

export async function compareVariables(
  template: string,
  originalText: string,
  ttsText: string
): Promise<Record<string, ComparisonResult>> {
  const templateVars = extractKeywords(template);
  const result: Record<string, ComparisonResult> = {};

  // Extract values using AI
  const originalValues = await extractValuesWithAI(originalText, template);
  const ttsValues = await extractValuesWithAI(ttsText, template);

  for (const varName of templateVars) {
    const originalValue = originalValues[varName]?.value || '';
    const ttsValue = ttsValues[varName]?.value || '';

    // So sánh giá trị bằng công thức
    const comparison = compareValues(originalValue, ttsValue);

    result[varName] = {
      key: varName,
      originalValue,
      ttsValue,
      match: comparison.match,
      similarity: comparison.similarity,
    };
  }

  return result;
}
