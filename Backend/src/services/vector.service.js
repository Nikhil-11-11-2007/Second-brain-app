export const generateEmbedding = async (text = "") => {
    return Array(128)
        .fill(0)
        .map((_, i) => text.length % (i + 1));
};

export const cosineSimilarity = (a = [], b = []) => {
    if (a.length !== b.length || a.length === 0) return 0;

    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dot / (magA * magB);
};