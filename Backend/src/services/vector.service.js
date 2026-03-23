export const generateEmbedding = async (text) => {
    return Array(128).fill(0).map(() => Math.random());
};

export const cosineSimilarity = (a, b) => {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
};