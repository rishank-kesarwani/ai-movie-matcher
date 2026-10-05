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
   - 🇮🇳 Bollywood & Indian Cinema: Hindi classics & blockbusters (e.g., 3 Idiots, Dangal, Sholay, Zindagi Na Milegi Dobara, Swades, Gangs of Wasseypur, Andhadhun, Tumbbad, Dil Chahta Hai, Lagaan, Jawan, Pathaan), Tollywood (RRR, Baahubali, Pushpa), Kollywood (Vikram, Nayakan, Kaithi), Malayalam masterpieces (Drishyam, Kumbalangi Nights, Manjummel Boys), top directors (Rajkumar Hirani, S.S. Rajamouli, Anurag Kashyap, Sanjay Leela Bhansali, Mani Ratnam, Lokesh Kanagaraj) and iconic stars (Shah Rukh Khan, Aamir Khan, Amitabh Bachchan, Deepika Padukone, Ranbir Kapoor, Kamal Haasan, Rajinikanth, Prabhas).
   - 🇺🇸 Hollywood & Western Cinema: Christopher Nolan, Denis Villeneuve, Quentin Tarantino, Martin Scorsese, David Fincher, Ridley Scott.
   - 🇰🇷 Korean Cinema & K-Thrillers: Bong Joon-ho (Parasite, Memories of Murder), Park Chan-wook (Oldboy, Decision to Leave), Train to Busan.
   - 🇯🇵 Japanese Cinema & Anime: Studio Ghibli (Spirited Away, Princess Mononoke), Makoto Shinkai (Your Name), Akira Kurosawa, Satoshi Kon.
   - 🌍 European, French, Spanish, Latin American, and International World Cinema.
3. When the user asks for movies (e.g. "I want feel-good movies like 3 Idiots and ZNMD", "Mind-bending sci-fi under 2 hours", "Action-packed South Indian mass cinema", "5 movies for a Friday night"), recommend 3-5 specific films.
4. For each recommended film, provide the release year, language/industry, director/lead cast, and explain *precisely* why it fits their criteria based on actual film attributes (tone, theme, director style, runtime). Do NOT hallucinate plot details.
5. Keep answers engaging, crisp, visually appealing, and beautifully structured with bullet points and emojis.`,
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
              if (details) {
                return {
                  ...details,
                  matchReason: suggestion.matchReason,
                };
              }
            }
            // Search movie by title
            const searchRes = await this.movieProvider.searchMovies(suggestion.title);
            if (searchRes.results && searchRes.results.length > 0) {
              return {
                ...searchRes.results[0],
                matchReason: suggestion.matchReason,
              };
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
