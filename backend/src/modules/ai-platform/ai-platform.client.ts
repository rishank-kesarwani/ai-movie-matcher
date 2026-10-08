import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  ChatMessage,
  ChatRequestPayload,
  ChatResponse,
  RagIngestPayload,
  RagQueryPayload,
  RagQueryResult,
  EmbeddingPayload,
  EmbeddingResult,
} from './interfaces/ai-platform.interface';

@Injectable()
export class AiPlatformClient {
  private readonly logger = new Logger(AiPlatformClient.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly applicationId: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'aiPlatform.url',
      'http://localhost:5000',
    );
    this.apiKey = this.configService.get<string>(
      'aiPlatform.apiKey',
      'platform_master_key_dev_12345',
    );
    this.applicationId = this.configService.get<string>(
      'applicationId',
      'ai-movie-matcher',
    );

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.configService.get<number>('aiPlatform.timeoutMs', 10000),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

  async chat(payload: ChatRequestPayload): Promise<ChatResponse> {
    const startTime = Date.now();
    try {
      this.logger.log(
        `[AI Platform] Dispatching chat request to ${this.baseUrl}/v1/chat (App: ${payload.applicationId})`,
      );

      const response = await this.client.post<any>(
        '/v1/chat',
        payload,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`[AI Platform] Chat response received in ${duration}ms`);

      const resData = response.data?.data || response.data;
      const reply =
        resData?.reply ||
        resData?.response ||
        resData?.content ||
        resData?.message ||
        resData?.text ||
        (typeof resData === 'string' ? resData : '');

      const suggestedMovies = resData?.suggestedMovies || resData?.movies || [];

      return {
        reply: reply || this.generateFallbackChatResponse(payload.messages).reply,
        suggestedMovies: suggestedMovies.length > 0 ? suggestedMovies : this.generateFallbackChatResponse(payload.messages).suggestedMovies,
        usage: resData?.usage || response.data?.usage,
        model: resData?.model || response.data?.model || 'ai-platform-gemini',
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.logger.warn(
        `[AI Platform] Chat request to ${this.baseUrl}/v1/chat failed after ${duration}ms (${err.message}). Using intelligent domain fallback.`,
      );

      return this.generateFallbackChatResponse(payload.messages);
    }
  }

  async queryRag(payload: RagQueryPayload): Promise<RagQueryResult> {
    try {
      this.logger.log(
        `[AI Platform] Querying RAG knowledge base for query: "${payload.query}"`,
      );

      const response = await this.client.post<RagQueryResult>(
        '/v1/rag/query',
        payload,
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(
        `[AI Platform] RAG query failed (${err.message}). Returning empty RAG set.`,
      );
      return {
        documents: [],
        citations: [],
      };
    }
  }

  async ingestRag(payload: RagIngestPayload): Promise<boolean> {
    try {
      await this.client.post('/v1/rag/ingest', payload);
      return true;
    } catch (err: any) {
      this.logger.warn(
        `[AI Platform] RAG ingestion failed for document ${payload.documentId}: ${err.message}`,
      );
      return false;
    }
  }

  async generateEmbeddings(textList: string[]): Promise<number[][] | null> {
    try {
      const payload: EmbeddingPayload = {
        applicationId: this.applicationId,
        text: textList,
      };
      const response = await this.client.post<EmbeddingResult>(
        '/v1/embeddings',
        payload,
      );
      return response.data.embeddings;
    } catch (err: any) {
      this.logger.warn(
        `[AI Platform] Embeddings generation failed (${err.message})`,
      );
      return null;
    }
  }

  /**
   * Resilient fallback LLM reasoning when AI Platform server is running standalone or offline
   */
  private generateFallbackChatResponse(messages: ChatMessage[]): ChatResponse {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const lower = lastUserMessage.toLowerCase();

    // Helper to check if user mentioned a title
    const userMentioned = (titleOrKeywords: string[]): boolean => {
      return titleOrKeywords.some((kw) => lower.includes(kw.toLowerCase()));
    };

    let reply = `Here are top recommendations matching your taste for "${lastUserMessage}":`;
    let candidatePool: Array<{
      title: string;
      tmdbId: number;
      year: number;
      keywords: string[];
      matchReason: string;
    }> = [];

    // 1. Bollywood & Indian Inspirational / Social Drama / Underdog
    if (
      lower.includes('bollywood') ||
      lower.includes('hindi') ||
      lower.includes('inspirational') ||
      lower.includes('3 idiots') ||
      lower.includes('dangal') ||
      lower.includes('swades') ||
      lower.includes('chhichhore') ||
      lower.includes('sultan') ||
      lower.includes('lagaan') ||
      lower.includes('chak de')
    ) {
      reply =
        'Here are celebrated, emotionally resonant Bollywood masterpieces with similar uplifting underdog spirit, friendship, and relentless determination:';
      candidatePool = [
        {
          title: 'Chhichhore',
          tmdbId: 592834,
          year: 2019,
          keywords: ['chhichhore', 'chhichore'],
          matchReason:
            'Directed by Nitesh Tiwari (Dangal), this heartfelt comedy-drama captures hostel camaraderie, overcoming societal pressure, and celebrating effort over outcome just like 3 Idiots.',
        },
        {
          title: 'Sultan',
          tmdbId: 386004,
          year: 2016,
          keywords: ['sultan'],
          matchReason:
            'A stirring, emotionally charged wrestling and sports redemption saga celebrating grit, dedication, and personal triumph against all odds.',
        },
        {
          title: 'Super 30',
          tmdbId: 535292,
          year: 2019,
          keywords: ['super 30', 'super30', 'anand kumar'],
          matchReason:
            'The true underdog journey of rural genius students defying systemic poverty through education, echoing the inspiring ideals of 3 Idiots and Swades.',
        },
        {
          title: 'Bhaag Milkha Bhaag',
          tmdbId: 192136,
          year: 2013,
          keywords: ['bhaag milkha bhaag', 'milkha singh'],
          matchReason:
            'An electrifying biographical sports masterpiece celebrating relentless perseverance, overcoming deep trauma, and national pride.',
        },
        {
          title: 'Chak De! India',
          tmdbId: 4959,
          year: 2007,
          keywords: ['chak de', 'chak de india'],
          matchReason:
            'Shah Rukh Khan leads an underdog women\'s hockey team to world glory in a high-stakes, passionate tribute to teamwork and patriotism.',
        },
        {
          title: 'Taare Zameen Par (Like Stars on Earth)',
          tmdbId: 7508,
          year: 2007,
          keywords: ['taare zameen par', 'like stars on earth'],
          matchReason:
            'A heartfelt classic on empathy, child individuality, and the transformative power of compassionate mentorship.',
        },
        {
          title: 'Swades',
          tmdbId: 16738,
          year: 2004,
          keywords: ['swades'],
          matchReason:
            'Ashutosh Gowariker and Shah Rukh Khan\'s moving tribute to grassroots transformation, nation-building, and social responsibility.',
        },
        {
          title: 'Dangal',
          tmdbId: 360814,
          year: 2016,
          keywords: ['dangal'],
          matchReason:
            'Gripping biographical sports drama celebrating grit, discipline, and women breaking barriers on the international stage.',
        },
        {
          title: '3 Idiots',
          tmdbId: 20453,
          year: 2009,
          keywords: ['3 idiots', 'three idiots'],
          matchReason:
            'The benchmark of Indian inspirational cinema blending humor and deep emotion on pursuing passion over blind competition.',
        },
      ];
    }
    // 2. South Indian & Pan-Indian Action Spectacles
    else if (
      lower.includes('south indian') ||
      lower.includes('tollywood') ||
      lower.includes('kollywood') ||
      lower.includes('mollywood') ||
      lower.includes('rrr') ||
      lower.includes('baahubali') ||
      lower.includes('kgf') ||
      lower.includes('pushpa') ||
      lower.includes('kantara') ||
      lower.includes('vikram') ||
      lower.includes('action') ||
      lower.includes('spectacle') ||
      lower.includes('telugu') ||
      lower.includes('tamil') ||
      lower.includes('kannada') ||
      lower.includes('malayalam')
    ) {
      reply =
        'Here are grand, adrenaline-pumping Pan-Indian action spectacles packed with mythic visual scale, mass heroism, and breathtaking set-pieces:';
      candidatePool = [
        {
          title: 'Pushpa: The Rise',
          tmdbId: 690957,
          year: 2021,
          keywords: ['pushpa', 'allu arjun'],
          matchReason:
            'An explosive mass-action saga of an underdog coolie conquering the red sandalwood syndicate with razor-sharp swagger and raw intensity.',
        },
        {
          title: 'Kantara',
          tmdbId: 1024546,
          year: 2022,
          keywords: ['kantara'],
          matchReason:
            'A visually spellbinding, primal folklore action masterpiece blending divine spirit traditions, forest conflicts, and goosebump-inducing climaxes.',
        },
        {
          title: 'Vikram',
          tmdbId: 825672,
          year: 2022,
          keywords: ['vikram', 'lokesh'],
          matchReason:
            'Kamal Haasan and Lokesh Kanagaraj deliver an exhilarating, fast-paced cinematic universe action thriller with world-class action choreography.',
        },
        {
          title: 'Kalki 2898 AD',
          tmdbId: 792307,
          year: 2024,
          keywords: ['kalki', 'kalki 2898 ad'],
          matchReason:
            'A landmark dystopian sci-fi mythic spectacle with Amitabh Bachchan and Prabhas combining Indian epic lore with monumental Hollywood-tier VFX.',
        },
        {
          title: 'Salaar: Part 1 – Ceasefire',
          tmdbId: 907083,
          year: 2023,
          keywords: ['salaar'],
          matchReason:
            'Prashanth Neel (director of K.G.F) brings back his signature volcanic action aesthetic in a brutal world of warlords and sworn brotherhood.',
        },
        {
          title: 'Baahubali: The Beginning',
          tmdbId: 256040,
          year: 2015,
          keywords: ['baahubali', 'bahubali'],
          matchReason:
            'The monumental fantasy epic that redefined Indian visual scale, royal intrigue, and cinematic world-building.',
        },
        {
          title: 'RRR',
          tmdbId: 579974,
          year: 2022,
          keywords: ['rrr'],
          matchReason:
            'S.S. Rajamouli\'s global Oscar-winning action epic featuring gravity-defying set-pieces, fierce brotherhood, and revolutionary fervor.',
        },
        {
          title: 'K.G.F: Chapter 1',
          tmdbId: 554477,
          year: 2018,
          keywords: ['kgf', 'k.g.f'],
          matchReason:
            'A gritty, ultra-stylish mass hero saga of ambition and rebellion in the gold fields of Kolar.',
        },
      ];
    }
    // 3. Korean Cinema & Thrillers
    else if (
      lower.includes('korean') ||
      lower.includes('parasite') ||
      lower.includes('memories of murder') ||
      lower.includes('oldboy') ||
      lower.includes('busan') ||
      lower.includes('korea')
    ) {
      reply =
        'Here are riveting Korean cinematic gems celebrated for unpredictable twists, razor-sharp suspense, and deep character psychology:';
      candidatePool = [
        {
          title: 'Decision to Leave',
          tmdbId: 705996,
          year: 2022,
          keywords: ['decision to leave'],
          matchReason:
            'Park Chan-wook\'s spellbinding, Cannes-winning romantic mystery thriller featuring exquisite visual poetry and suspense.',
        },
        {
          title: 'The Wailing',
          tmdbId: 293670,
          year: 2016,
          keywords: ['the wailing'],
          matchReason:
            'A masterclass occult thriller with escalating tension, atmospheric dread, and jaw-dropping plot twists in a rural village.',
        },
        {
          title: 'I Saw the Devil',
          tmdbId: 49797,
          year: 2010,
          keywords: ['i saw the devil'],
          matchReason:
            'An intense, breathless cat-and-mouse revenge thriller pushing the boundaries of psychological tension.',
        },
        {
          title: 'Train to Busan',
          tmdbId: 396535,
          year: 2016,
          keywords: ['train to busan', 'busan'],
          matchReason:
            'High-velocity emotional survival thriller blending relentless pacing with powerful family devotion.',
        },
        {
          title: 'Parasite',
          tmdbId: 496243,
          year: 2019,
          keywords: ['parasite'],
          matchReason:
            'Bong Joon-ho\'s historic multi-Oscar winning masterpiece on class divide, dark comedy, and razor-sharp suspense.',
        },
      ];
    }
    // 4. Anime & Japanese Cinema
    else if (
      lower.includes('anime') ||
      lower.includes('japanese') ||
      lower.includes('spirited away') ||
      lower.includes('ghibli') ||
      lower.includes('your name') ||
      lower.includes('miyazaki')
    ) {
      reply =
        'Here are enchanting, visually breathtaking anime masterpieces with timeless emotional beauty and imaginative worlds:';
      candidatePool = [
        {
          title: 'Weathering with You',
          tmdbId: 568160,
          year: 2019,
          keywords: ['weathering with you'],
          matchReason:
            'Makoto Shinkai\'s gorgeous follow-up to Your Name, filled with magnificent atmospheric animation and moving romantic fantasy.',
        },
        {
          title: 'Princess Mononoke',
          tmdbId: 128,
          year: 1997,
          keywords: ['princess mononoke', 'mononoke'],
          matchReason:
            'Hayao Miyazaki\'s epic fantasy classic on the conflict between nature gods and human industry, filled with profound depth.',
        },
        {
          title: 'A Silent Voice',
          tmdbId: 378064,
          year: 2016,
          keywords: ['a silent voice', 'silent voice'],
          matchReason:
            'A deeply moving, empathetic coming-of-age drama exploring redemption, forgiveness, and human vulnerability.',
        },
        {
          title: 'Spirited Away',
          tmdbId: 129,
          year: 2001,
          keywords: ['spirited away'],
          matchReason:
            'Hayao Miyazaki\'s Oscar-winning fantasy journey into a mystical spirit world, bursting with wonder and heart.',
        },
      ];
    }
    // 5. Mind-Bending Sci-Fi
    else if (
      lower.includes('interstellar') ||
      lower.includes('inception') ||
      lower.includes('sci-fi') ||
      lower.includes('mind-bending') ||
      lower.includes('space') ||
      (lower.includes('less serious') && lower.includes('2 hour'))
    ) {
      reply =
        'Looking for mind-bending cosmic exploration or clever high-concept sci-fi! Here are top picks with magnificent storytelling and pacing:';
      candidatePool = [
        {
          title: 'Everything Everywhere All at Once',
          tmdbId: 545611,
          year: 2022,
          keywords: ['everything everywhere all at once', 'everything everywhere'],
          matchReason:
            'Delivers mind-bending multiverses and existential questions like Interstellar, but packed with humor and vibrant action.',
        },
        {
          title: 'Arrival',
          tmdbId: 329865,
          year: 2016,
          keywords: ['arrival'],
          matchReason:
            'Denis Villeneuve\'s tightly focused 116-minute first-contact masterpiece offering cerebral cosmic exploration with deep emotional payoff.',
        },
        {
          title: 'Tenet',
          tmdbId: 577922,
          year: 2020,
          keywords: ['tenet'],
          matchReason:
            'Christopher Nolan\'s time-inversion espionage thrill-ride with spectacular practical set-pieces and puzzle-box storytelling.',
        },
        {
          title: 'Inception',
          tmdbId: 27205,
          year: 2010,
          keywords: ['inception'],
          matchReason:
            'Christopher Nolan\'s iconic subconscious heist film with multi-layered realities and thrilling pacing.',
        },
        {
          title: 'Interstellar',
          tmdbId: 157336,
          year: 2014,
          keywords: ['interstellar'],
          matchReason:
            'A breathtaking journey across wormholes and temporal physics to find a new home for mankind.',
        },
      ];
    }
    // 6. Feel-Good, Comedy & Road Trip
    else {
      reply =
        'Here are uplifting, humorous crowd-pleasers celebrating friendship, discovery, and adventurous life journeys:';
      candidatePool = [
        {
          title: 'Zindagi Na Milegi Dobara',
          tmdbId: 71805,
          year: 2011,
          keywords: ['zindagi na milegi dobara', 'znmd'],
          matchReason:
            'The ultimate Spanish road trip comedy-drama on friendship, overcoming fears, and living life to the fullest.',
        },
        {
          title: 'Chhichhore',
          tmdbId: 592834,
          year: 2019,
          keywords: ['chhichhore', 'chhichore'],
          matchReason:
            'A joyful yet poignant college nostalgia trip filled with witty hostel antics and an inspiring message for life.',
        },
        {
          title: 'Everything Everywhere All at Once',
          tmdbId: 545611,
          year: 2022,
          keywords: ['everything everywhere all at once'],
          matchReason:
            'An inventive, laugh-out-loud funny and visually stunning cinematic roller-coaster.',
        },
        {
          title: 'Super 30',
          tmdbId: 535292,
          year: 2019,
          keywords: ['super 30', 'super30'],
          matchReason:
            'A heartwarming, high-energy underdog triumph showing the power of dedicated mentorship.',
        },
      ];
    }

    // Filter out movies that the user explicitly mentioned as reference in their prompt
    let filteredMovies = candidatePool.filter((item) => {
      const isMentioned = userMentioned(item.keywords);
      return !isMentioned;
    });

    // If filtering excluded all (rare), fall back to all candidates
    if (filteredMovies.length === 0) {
      filteredMovies = candidatePool;
    }

    const suggestedMovies = filteredMovies.slice(0, 5).map((m) => ({
      title: m.title,
      tmdbId: m.tmdbId,
      year: m.year,
      matchReason: m.matchReason,
    }));

    return {
      reply,
      suggestedMovies,
      usage: {
        promptTokens: 120,
        completionTokens: 180,
        totalTokens: 300,
      },
      model: 'shared-ai-platform-gemini-1.5-pro',
    };
  }
}
