import { pipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

// Singleton embedder
let embedderInstance = null;

const getEmbedder = async () => {
  if (!embedderInstance) {
    embedderInstance = await pipeline(
      "feature-extraction",
      "Xenova/e5-small-v2"
    );
  }
  return embedderInstance;
};

// Pinecone setup
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX);

// Embedding function
export const generateEmbedding = async (text = "") => {
  try {
    if (!text || !text.trim()) return [];

    const embedder = await getEmbedder();
    const output = await embedder(`passage: ${text}`);

    let embedding;

    // CASE: flattened vector
    if (output?.data instanceof Float32Array) {
      const flat = Array.from(output.data);
      const DIM = 384;

      if (flat.length % DIM !== 0) return [];

      const tokens = flat.length / DIM;
      const pooled = new Array(DIM).fill(0);

      for (let i = 0; i < tokens; i++) {
        for (let j = 0; j < DIM; j++) {
          pooled[j] += flat[i * DIM + j];
        }
      }

      embedding = pooled.map(val => val / tokens);
    }

    // CASE: nested array
    else if (Array.isArray(output?.data) && Array.isArray(output.data[0])) {
      const tokens = output.data.length;
      const dims = output.data[0].length;
      const pooled = new Array(dims).fill(0);

      for (let i = 0; i < tokens; i++) {
        for (let j = 0; j < dims; j++) {
          pooled[j] += output.data[i][j];
        }
      }

      embedding = pooled.map(val => val / tokens);
    }

    else {
      return [];
    }

    // Clean NaN
    return embedding.map(val => (isNaN(val) ? 0 : Number(val)));
  } catch {
    return [];
  }
};

// Save to Pinecone
export const saveToPinecone = async (itemId, embedding, metadata = {}) => {
  if (!embedding || embedding.length === 0) return;

  await index.upsert({
    records: [
      {
        id: String(itemId),
        values: embedding,
        metadata: metadata || {},
      },
    ],
  });
};

// Query
export const queryRelatedItems = async (embedding, userId) => {
  if (!embedding.length) return [];

  const result = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,

    // 🔥 ADD THIS
    filter: {
      userId: userId.toString()
    }
  });

  return result.matches || [];
};

// Delete
export const deleteVector = async (ids = []) => {
  if (!ids.length) return;

  await index.deleteMany({
    ids: ids
  });
};