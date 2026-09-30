export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequestPayload {
  applicationId: string;
  userId?: string;
  messages: ChatMessage[];
  useRag?: boolean;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  reply: string;
  suggestedMovies?: Array<{
    title: string;
    tmdbId?: number;
    year?: number;
    matchReason: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface RagIngestPayload {
  applicationId: string;
  documentId: string;
  title: string;
  content: string;
  category: string;
  visibility?: 'public' | 'private';
  metadata?: Record<string, any>;
}

export interface RagQueryPayload {
  applicationId: string;
  query: string;
  limit?: number;
  minScore?: number;
  userId?: string;
}

export interface RagQueryResult {
  answer?: string;
  documents: Array<{
    documentId: string;
    title: string;
    content: string;
    category: string;
    score: number;
    metadata?: Record<string, any>;
  }>;
  citations: Array<{
    title: string;
    source: string;
    snippet?: string;
  }>;
}

export interface EmbeddingPayload {
  applicationId: string;
  text: string | string[];
}

export interface EmbeddingResult {
  embeddings: number[][];
  dimensions: number;
}
