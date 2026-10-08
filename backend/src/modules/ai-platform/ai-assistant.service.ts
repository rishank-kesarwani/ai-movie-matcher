import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiPlatformClient } from './ai-platform.client';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { ChatMessage, ChatResponse } from './interfaces/ai-platform.interface';
import { MovieProviderService } from '../movie-provider/movie-provider.service';

export interface AssistantChatDto {
  messages: ChatMessage[];
  useRag?: boolean;
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly applicationId: string;

  constructor(
    private readonly aiClient: AiPlatformClient,
    private readonly costTracker: AiCostTrackerService,
    private readonly movieProvider: MovieProviderService,
    private readonly configService: ConfigService,
  ) {
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-movie-matcher',
    );
  }

  async chat(
    userId: string | undefined,
    dto: AssistantChatDto,
  ): Promise<ChatResponse & { enrichedMovies?: any[] }> {
    const effectiveUserId = userId || 'anonymous';
    const startTime = Date.now();

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are CineMatch AI, an elite, charismatic, and deeply knowledgeable global movie recommendation intelligence for the AI Movie Matcher platform.
Your mission:
1. Understand nuanced cinematic tastes, themes, directors, actors, tone, pacing, runtime constraints, and moods across WORLDWIDE and INDIAN cinema.
2. You possess encyclopedic mastery of:
   - 🇮🇳 Bollywood & Indian Cinema: Hindi classics & blockbusters (e.g., Chhichhore, Sultan, Super 30, Bhaag Milkha Bhaag, Chak De! India, 3 Idiots, Dangal, Sholay, Zindagi Na Milegi Dobara, Swades, Gangs of Wasseypur, Andhadhun, Tumbbad, Dil Chahta Hai, Lagaan, Jawan, Pathaan), Tollywood & Pan-Indian (Pushpa, Kantara, Vikram, Kalki 2898 AD, Salaar, RRR, Baahubali, KGF), Kollywood (Vikram, Nayakan, Kaithi), Malayalam masterpieces (Drishyam, Kumbalangi Nights, Manjummel Boys), top directors (Rajkumar Hirani, S.S. Rajamouli, Nitesh Tiwari, Anurag Kashyap, Sanjay Leela Bhansali, Mani Ratnam, Lokesh Kanagaraj) and iconic stars.
   - 🇺🇸 Hollywood & Western Cinema: Christopher Nolan, Denis Villeneuve, Quentin Tarantino, Martin Scorsese, David Fincher, Ridley Scott.
   - 🇰🇷 Korean Cinema & K-Thrillers: Bong Joon-ho (Parasite, Memories of Murder), Park Chan-wook (Oldboy, Decision to Leave), Train to Busan, The Wailing.
   - 🇯🇵 Japanese Cinema & Anime: Studio Ghibli (Spirited Away, Princess Mononoke), Makoto Shinkai (Your Name, Weathering with You, Suzume), Akira Kurosawa.
   - 🌍 European, French, Spanish, Latin American, and International World Cinema.
3. CRITICAL RECOMMENDATION RULE: When the user asks for recommendations "like [Movie A], [Movie B], [Movie C]" or provides examples of films they like, DO NOT recommend [Movie A], [Movie B], or [Movie C] back to the user! The user already knows and has watched those films. Instead, recommend OTHER similar, high-match movies that capture that same vibe, narrative theme, intensity, or director style (e.g. for "like 3 Idiots, Dangal, Swades" -> recommend Chhichhore, Sultan, Super 30, Bhaag Milkha Bhaag, Chak De! India; for "like RRR, Baahubali, KGF" -> recommend Pushpa: The Rise, Kantara, Vikram, Kalki 2898 AD, Salaar, Kaithi).
4. Recommend 3-5 specific films matching their request.
5. For each recommended film, provide the release year, language/industry, director/lead cast, and explain *precisely* why it fits their criteria based on actual film attributes. Do NOT hallucinate plot details.
6. Keep answers engaging, crisp, visually appealing, and beautifully structured with bullet points and emojis.`,
    };

    const messagesWithSystem: ChatMessage[] = [
      systemPrompt,
      ...dto.messages,
    ];

    const result = await this.aiClient.chat({
      applicationId: this.applicationId,
      userId: effectiveUserId,
      messages: messagesWithSystem,
      useRag: dto.useRag !== false,
      temperature: 0.7,
    });

    const durationMs = Date.now() - startTime;
    this.costTracker.trackUsage({
      userId: effectiveUserId,
      endpoint: '/api/v1/ai/chat',
      model: result.model || 'gemini-1.5-pro',
      promptTokens: result.usage?.promptTokens || 150,
      completionTokens: result.usage?.completionTokens || 200,
      durationMs,
    });

    // If movies were suggested by title, enrich them with TMDB posters & ratings
    let enrichedMovies: any[] = [];
    if (result.suggestedMovies && result.suggestedMovies.length > 0) {
      enrichedMovies = await Promise.all(
        result.suggestedMovies.map(async (suggestion) => {
          try {
            if (suggestion.tmdbId) {
              const details = await this.movieProvider.getMovieDetails(suggestion.tmdbId);
              if (details && !details.adult) {
                return {
                  ...details,
                  matchReason: suggestion.matchReason,
                };
              }
            }
            // Search movie by title
            const searchRes = await this.movieProvider.searchMovies(suggestion.title);
            if (searchRes.results && searchRes.results.length > 0) {
              const matched = searchRes.results.find((r) => !r.adult) || searchRes.results[0];
              if (matched && !matched.adult) {
                return {
                  ...matched,
                  matchReason: suggestion.matchReason,
                };
              }
            }
          } catch (err: any) {
            this.logger.warn(`Could not enrich suggested movie "${suggestion.title}": ${err.message}`);
          }
          return {
            id: suggestion.tmdbId || Math.floor(Math.random() * 100000),
            title: suggestion.title,
            overview: suggestion.matchReason,
            releaseDate: suggestion.year ? `${suggestion.year}-01-01` : '',
            voteAverage: 8.0,
            voteCount: 1000,
            popularity: 80,
            genreIds: [],
            matchReason: suggestion.matchReason,
          };
        }),
      );
    }

    return {
      ...result,
      enrichedMovies: enrichedMovies.filter(Boolean),
    };
  }
}
