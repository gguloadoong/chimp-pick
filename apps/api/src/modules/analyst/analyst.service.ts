import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalystPost, UserPosition } from '@prisma/client';

export type AnalystPostWithMeta = AnalystPost & {
  _count: { positions: number };
  humanIndicator: { longPct: number; shortPct: number; totalVotes: number } | null;
};

type Character = 'LONG' | 'SHORT' | 'NEUTRAL' | 'WAVE';

const CHARACTER_PROMPTS: Record<Character, string> = {
  LONG: '롱충이 박사: 낙관론자. 강세 근거 제시. 반말 병맛 어투. 3줄 이내.',
  SHORT: '숏충이 교수: 비관론자. 리스크 강조. 냉소적 어투. 3줄 이내.',
  NEUTRAL: '침팬지 AI: 중립 데이터봇. 수치와 팩트만. 3줄 이내.',
  WAVE: '파도타기 선생: 모멘텀 추종. 지금 방향 올라타기. 3줄 이내.',
};

const VALID_CHARACTERS = new Set<string>(['LONG', 'SHORT', 'NEUTRAL', 'WAVE']);

@Injectable()
export class AnalystService {
  private readonly logger = new Logger(AnalystService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }

  async getPosts(limit = 20): Promise<AnalystPostWithMeta[]> {
    try {
      const posts = await this.prisma.analystPost.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { positions: true } },
          humanIndicator: {
            select: { longPct: true, shortPct: true, totalVotes: true },
          },
        },
      });
      return posts;
    } catch (error) {
      this.logger.error('getPosts 실패', error);
      throw error;
    }
  }

  async reactToPost(
    userId: string,
    postId: string,
    direction: 'LONG' | 'SHORT',
  ): Promise<{ post: AnalystPost; position: UserPosition }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 기존 포지션 조회
        const existing = await tx.userPosition.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        // 포스트 존재 여부 확인
        const post = await tx.analystPost.findUnique({ where: { id: postId } });
        if (!post) {
          throw new NotFoundException(`포스트를 찾을 수 없습니다: ${postId}`);
        }

        let longDelta = 0;
        let shortDelta = 0;

        if (existing) {
          if (existing.direction === direction) {
            // 같은 방향 재클릭 → 취소 (토글)
            await tx.userPosition.delete({
              where: { userId_postId: { userId, postId } },
            });

            if (direction === 'LONG') longDelta = -1;
            else shortDelta = -1;

            const updatedPost = await tx.analystPost.update({
              where: { id: postId },
              data: {
                longCount: { increment: longDelta },
                shortCount: { increment: shortDelta },
              },
            });

            await this.upsertHumanIndicator(tx, postId, updatedPost.longCount, updatedPost.shortCount);

            return { post: updatedPost, position: existing };
          }

          // 방향 변경: 이전 방향 감소, 새 방향 증가
          if (existing.direction === 'LONG') {
            longDelta = -1;
            shortDelta = 1;
          } else {
            longDelta = 1;
            shortDelta = -1;
          }
        } else {
          // 신규 포지션
          if (direction === 'LONG') longDelta = 1;
          else shortDelta = 1;
        }

        const position = await tx.userPosition.upsert({
          where: { userId_postId: { userId, postId } },
          create: { userId, postId, direction },
          update: { direction },
        });

        const updatedPost = await tx.analystPost.update({
          where: { id: postId },
          data: {
            longCount: { increment: longDelta },
            shortCount: { increment: shortDelta },
          },
        });

        await this.upsertHumanIndicator(tx, postId, updatedPost.longCount, updatedPost.shortCount);

        return { post: updatedPost, position };
      });
    } catch (error) {
      this.logger.error(`reactToPost 실패 — userId=${userId}, postId=${postId}`, error);
      throw error;
    }
  }

  async generatePost(character: string, eventType?: string): Promise<AnalystPost> {
    if (!VALID_CHARACTERS.has(character)) {
      throw new Error(`유효하지 않은 character: ${character}. 허용값: LONG | SHORT | NEUTRAL | WAVE`);
    }

    const validCharacter = character as Character;
    const prompt = CHARACTER_PROMPTS[validCharacter];
    const eventContext = eventType ? ` 이벤트: ${eventType}.` : '';
    const fullPrompt = `${prompt}${eventContext}\n\n발언 내용과 근거를 JSON으로 반환하라: { "content": "...", "reasoning": "..." }`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      let content: string;
      let reasoning: string | undefined;

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as { content?: string; reasoning?: string };
          content = parsed.content ?? text;
          reasoning = parsed.reasoning;
        } else {
          content = text;
        }
      } catch {
        this.logger.warn('Gemini 응답 JSON 파싱 실패, 원문 사용');
        content = text;
      }

      const post = await this.prisma.analystPost.create({
        data: {
          character: validCharacter,
          content,
          reasoning: reasoning ?? null,
          symbols: [],
          eventType: eventType ?? null,
          timeframe: 'DAILY',
          humanIndicator: {
            create: { longPct: 0, shortPct: 0, totalVotes: 0 },
          },
        },
      });

      this.logger.log(`generatePost 완료 — character=${validCharacter}, postId=${post.id}`);
      return post;
    } catch (error) {
      this.logger.error(`generatePost 실패 — character=${character}`, error);
      throw error;
    }
  }

  private async upsertHumanIndicator(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    postId: string,
    longCount: number,
    shortCount: number,
  ): Promise<void> {
    const totalVotes = longCount + shortCount;
    const longPct = totalVotes > 0 ? (longCount / totalVotes) * 100 : 0;
    const shortPct = totalVotes > 0 ? (shortCount / totalVotes) * 100 : 0;

    await tx.humanIndicator.upsert({
      where: { postId },
      create: { postId, longPct, shortPct, totalVotes },
      update: { longPct, shortPct, totalVotes },
    });
  }
}
