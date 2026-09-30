export const QUEUES = {
  RECOMMENDATION: 'movie-recommendation-queue',
  NOTIFICATION: 'movie-notification-queue',
  MOVIE_SYNC: 'movie-catalog-sync-queue',
  EMBEDDINGS: 'movie-embeddings-queue',
  DLQ: 'dead-letter-queue',
};

export const JOB_NAMES = {
  GENERATE_RECOMMENDATIONS: 'generate-user-recommendations',
  DISPATCH_NOTIFICATION: 'dispatch-user-notification',
  SYNC_TRENDING_MOVIES: 'sync-trending-movies',
  GENERATE_EMBEDDINGS: 'generate-movie-embeddings',
};
