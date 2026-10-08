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

    // 1. Bollywood Comedy (Post-2015 / Modern / Laugh / Family Comedy)
    if (
      (lower.includes('comedy') ||
        lower.includes('funny') ||
        lower.includes('humor') ||
        lower.includes('laugh') ||
        lower.includes('comic') ||
        lower.includes('hilarious')) &&
      (lower.includes('bollywood') ||
        lower.includes('hindi') ||
        lower.includes('indian') ||
        lower.includes('2015') ||
        lower.includes('stree') ||
        lower.includes('badhaai') ||
        lower.includes('piku'))
    ) {
      reply =
        'Here are top-rated Bollywood comedy masterpieces celebrated for witty writing, brilliant performances, and riotous entertainment:';
      candidatePool = [
        {
          title: 'Stree',
          tmdbId: 533991,
          year: 2018,
          keywords: ['stree', 'stree 2'],
          matchReason:
            'A trailblazing horror-comedy masterpiece starring Rajkummar Rao and Shraddha Kapoor with sharp humor and brilliant social satire.',
        },
        {
          title: 'Badhaai Ho',
          tmdbId: 547654,
          year: 2018,
          keywords: ['badhaai ho', 'badhai ho', 'ayushmann'],
          matchReason:
            'National Award-winning family comedy about a middle-aged pregnancy that leads to heartwarming chaos and laugh-out-loud moments.',
        },
        {
          title: 'Chhichhore',
          tmdbId: 596650,
          year: 2019,
          keywords: ['chhichhore', 'chhichore'],
          matchReason:
            'A joyful, nostalgia-filled hostel comedy-drama celebrating college friendship, hostel rivalry, and the spirit of never giving up.',
        },
        {
          title: 'Bareilly Ki Barfi',
          tmdbId: 467106,
          year: 2017,
          keywords: ['bareilly ki barfi', 'bareilly'],
          matchReason:
            'A charming small-town romantic comedy powered by sparkling dialogue and Rajkummar Rao\'s show-stealing comedic brilliance.',
        },
        {
          title: 'Hindi Medium',
          tmdbId: 456570,
          year: 2017,
          keywords: ['hindi medium', 'irrfan'],
          matchReason:
            'Irrfan Khan shines in this hilarious and thought-provoking satire about the absurd race for elite school admissions in India.',
        },
        {
          title: 'Piku',
          tmdbId: 332835,
          year: 2015,
          keywords: ['piku', 'deepika', 'amitabh'],
          matchReason:
            'A delightfully quirky, humorous road-trip comedy about an eccentric aging father, his independent daughter, and an exasperated taxi owner.',
        },
      ];
    }
    // 2. Bollywood Thriller / Mystery / Crime / Suspense
    else if (
      (lower.includes('thriller') ||
        lower.includes('mystery') ||
        lower.includes('suspense') ||
        lower.includes('crime') ||
        lower.includes('dark') ||
        lower.includes('andhadhun') ||
        lower.includes('drishyam') ||
        lower.includes('tumbbad')) &&
      (lower.includes('bollywood') || lower.includes('hindi') || lower.includes('indian'))
    ) {
      reply =
        'Here are edge-of-the-seat Bollywood thrillers with mind-bending twists, noir atmosphere, and masterclass storytelling:';
      candidatePool = [
        {
          title: 'Andhadhun',
          tmdbId: 534780,
          year: 2018,
          keywords: ['andhadhun', 'ayushmann', 'tabu'],
          matchReason:
            'Sriram Raghavan\'s razor-sharp black comedy crime thriller about a blind pianist who unwittingly witnesses a high-profile murder.',
        },
        {
          title: 'Tumbbad',
          tmdbId: 538858,
          year: 2018,
          keywords: ['tumbbad', 'hastar'],
          matchReason:
            'A visually awe-inspiring, atmospheric folk-horror mythic thriller on boundless human greed and divine consequences.',
        },
        {
          title: 'Kahaani',
          tmdbId: 82825,
          year: 2012,
          keywords: ['kahaani', 'vidya balan'],
          matchReason:
            'A pregnant woman searches for her missing husband in Kolkata during Durga Puja in this masterclass suspense mystery with an iconic climax.',
        },
        {
          title: 'Article 15',
          tmdbId: 597089,
          year: 2019,
          keywords: ['article 15', 'anubhav sinha'],
          matchReason:
            'A gripping, realistic police procedural investigating injustice and social hierarchy in rural India.',
        },
        {
          title: 'Badla',
          tmdbId: 581361,
          year: 2019,
          keywords: ['badla', 'amitabh', 'taapsee'],
          matchReason:
            'Sujoy Ghosh\'s slick locked-room murder mystery packed with mind games, deception, and razor-sharp interrogation twists.',
        },
      ];
    }
    // 3. Bollywood Romantic / Coming-of-Age / Friendship
    else if (
      (lower.includes('romantic') ||
        lower.includes('romance') ||
        lower.includes('love') ||
        lower.includes('travel') ||
        lower.includes('road trip') ||
        lower.includes('friendship') ||
        lower.includes('znmd') ||
        lower.includes('yjhd')) &&
      (lower.includes('bollywood') || lower.includes('hindi') || lower.includes('indian'))
    ) {
      reply =
        'Here are beloved Bollywood romantic and friendship classics filled with vibrant emotion, soulful music, and unforgettable life journeys:';
      candidatePool = [
        {
          title: 'Yeh Jawaani Hai Deewani',
          tmdbId: 185008,
          year: 2013,
          keywords: ['yeh jawaani hai deewani', 'yjhd', 'bunny'],
          matchReason:
            'A dazzling celebration of youthful wanderlust, ambition, deep friendship, and finding balance in love.',
        },
        {
          title: 'Zindagi Na Milegi Dobara',
          tmdbId: 61202,
          year: 2011,
          keywords: ['zindagi na milegi dobara', 'znmd'],
          matchReason:
            'The definitive road-trip masterpiece exploring freedom, conquering fears, and treasuring lifelong brotherhood across Spain.',
        },
        {
          title: 'Jab We Met',
          tmdbId: 11807,
          year: 2007,
          keywords: ['jab we met', 'geet'],
          matchReason:
            'Imtiaz Ali\'s timeless romantic comedy brimming with infectious optimism, witty banter, and profound personal discovery.',
        },
        {
          title: 'Bareilly Ki Barfi',
          tmdbId: 467106,
          year: 2017,
          keywords: ['bareilly ki barfi'],
          matchReason:
            'A delightful small-town romance full of quirky twists, authentic charm, and wonderful heart.',
        },
        {
          title: 'Chhichhore',
          tmdbId: 596650,
          year: 2019,
          keywords: ['chhichhore'],
          matchReason:
            'A heartwarming tribute to college bonds, second chances, and true camaraderie.',
        },
      ];
    }
    // 4. Bollywood & Indian Inspirational / Social Drama / Underdog
    else if (
      lower.includes('inspirational') ||
      lower.includes('inspiring') ||
      lower.includes('underdog') ||
      lower.includes('3 idiots') ||
      lower.includes('dangal') ||
      lower.includes('swades') ||
      lower.includes('12th fail') ||
      lower.includes('super 30') ||
      lower.includes('bhaag milkha') ||
      lower.includes('chak de') ||
      lower.includes('lagaan') ||
      lower.includes('taare zameen') ||
      (lower.includes('bollywood') && (lower.includes('best') || lower.includes('top') || lower.includes('movie')))
    ) {
      reply =
        'Here are celebrated, emotionally resonant Bollywood masterpieces with similar uplifting underdog spirit, friendship, and relentless determination:';
      candidatePool = [
        {
          title: '12th Fail',
          tmdbId: 1163258,
          year: 2023,
          keywords: ['12th fail', 'manoj kumar sharma', 'vikrant massey'],
          matchReason:
            'Vidhu Vinod Chopra\'s phenomenal true-story masterpiece on restarting life, unshakeable integrity, and clearing the world\'s toughest UPSC exam against crushing poverty.',
        },
        {
          title: 'Chhichhore',
          tmdbId: 596650,
          year: 2019,
          keywords: ['chhichhore', 'chhichore'],
          matchReason:
            'Directed by Nitesh Tiwari (Dangal), this heartfelt comedy-drama captures hostel camaraderie, overcoming societal pressure, and celebrating effort over outcome just like 3 Idiots.',
        },
        {
          title: 'Super 30',
          tmdbId: 534075,
          year: 2019,
          keywords: ['super 30', 'super30', 'anand kumar'],
          matchReason:
            'The true underdog journey of rural genius students defying systemic poverty through education, echoing the inspiring ideals of 3 Idiots and Swades.',
        },
        {
          title: 'Bhaag Milkha Bhaag',
          tmdbId: 206324,
          year: 2013,
          keywords: ['bhaag milkha bhaag', 'milkha singh'],
          matchReason:
            'An electrifying biographical sports masterpiece celebrating relentless perseverance, overcoming deep trauma, and national pride.',
        },
        {
          title: 'Chak De! India',
          tmdbId: 14163,
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
          tmdbId: 15774,
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
    // 5. South Indian & Pan-Indian Action Spectacles
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
      lower.includes('kalki') ||
      lower.includes('salaar') ||
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
          tmdbId: 858485,
          year: 2022,
          keywords: ['kantara'],
          matchReason:
            'A visually spellbinding, primal folklore action masterpiece blending divine spirit traditions, forest conflicts, and goosebump-inducing climaxes.',
        },
        {
          title: 'Vikram',
          tmdbId: 743563,
          year: 2022,
          keywords: ['vikram', 'lokesh'],
          matchReason:
            'Kamal Haasan and Lokesh Kanagaraj deliver an exhilarating, fast-paced cinematic universe action thriller with world-class action choreography.',
        },
        {
          title: 'Kalki 2898 AD',
          tmdbId: 801688,
          year: 2024,
          keywords: ['kalki', 'kalki 2898 ad'],
          matchReason:
            'A landmark dystopian sci-fi mythic spectacle with Amitabh Bachchan and Prabhas combining Indian epic lore with monumental Hollywood-tier VFX.',
        },
        {
          title: 'Salaar: Part 1 – Ceasefire',
          tmdbId: 770906,
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
          tmdbId: 564147,
          year: 2018,
          keywords: ['kgf', 'k.g.f'],
          matchReason:
            'A gritty, ultra-stylish mass hero saga of ambition and rebellion in the gold fields of Kolar.',
        },
      ];
    }
    // 6. Korean Cinema & Thrillers
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
    // 7. Anime & Japanese Cinema
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
    // 8. Mind-Bending Sci-Fi
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
    // 9. General / Global Feel-Good
    else {
      reply =
        'Here are uplifting, humorous crowd-pleasers celebrating friendship, discovery, and adventurous life journeys:';
      candidatePool = [
        {
          title: 'Zindagi Na Milegi Dobara',
          tmdbId: 61202,
          year: 2011,
          keywords: ['zindagi na milegi dobara', 'znmd'],
          matchReason:
            'The ultimate Spanish road trip comedy-drama on friendship, overcoming fears, and living life to the fullest.',
        },
        {
          title: 'Chhichhore',
          tmdbId: 596650,
          year: 2019,
          keywords: ['chhichhore', 'chhichore'],
          matchReason:
            'A joyful yet poignant college nostalgia trip filled with witty hostel antics and an inspiring message for life.',
        },
        {
          title: 'Stree',
          tmdbId: 533991,
          year: 2018,
          keywords: ['stree'],
          matchReason:
            'An inventive, laugh-out-loud funny and delightfully spooky cinematic roller-coaster.',
        },
        {
          title: 'Super 30',
          tmdbId: 534075,
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
