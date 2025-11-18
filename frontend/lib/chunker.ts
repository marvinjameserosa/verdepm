export function chunkText(text: string, maxWordsPerChunk = 80) {
  const words = text.split(" ");
  const chunks = [];
  
  for (let i = 0; i < words.length; i += maxWordsPerChunk) {
    const chunk = words.slice(i, i + maxWordsPerChunk).join(" ");
    chunks.push(chunk);
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}
