import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedValue {
  key: string;
  value: string;
  confidence: number;
}

export async function extractValuesWithAI(
  text: string,
  template: string
): Promise<Record<string, ExtractedValue>> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `Bạn là một AI assistant chuyên về trích xuất thông tin từ văn bản.
          Nhiệm vụ của bạn là trích xuất các giá trị dựa vào template được cung cấp.
          LƯU Ý QUAN TRỌNG: Hãy giữ nguyên chính xác các từ khi trích xuất, không được bỏ qua bất kỳ từ nào.
          Hãy trả về kết quả dưới dạng JSON với format:
          {
            "key1": { "value": "extracted_value", "confidence": 0.95 },
            "key2": { "value": "extracted_value", "confidence": 0.85 }
          }
          Trong đó confidence là độ tin cậy của giá trị được trích xuất, từ 0 đến 1.`,
        },
        {
          role: 'user',
          content: `Template: \`\`\`${template}\`\`\`\nText: \`\`\`${text}\`\`\``,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 8000,
      top_p: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error extracting values with AI:', error);
    throw error;
  }
}
