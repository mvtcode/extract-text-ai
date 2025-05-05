import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    const audioFile = fs.createReadStream(filePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'vi',
      response_format: 'json',
      prompt: 'Dữ liệu transcript không được viết tắt, nếu là số bỏ số 0 ở đầu. Chúng tôi có các thuật ngữ tương đương nhau:\n Vi Mô: VMO, vimo.\nVNĐ: Việt nam đồng\nGặp các thuật ngữ tương đương thì hãy output bằng key',
      temperature: 0.2,
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
