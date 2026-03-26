import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalendarService, EconomicEvent } from './calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: '다가오는 경제 이벤트 조회', description: '오늘 기준 N일 이내 경제 이벤트를 반환합니다.' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '조회 기간(일)', example: 30 })
  @ApiResponse({ status: 200, description: '이벤트 목록 반환 성공' })
  getUpcomingEvents(
    @Query('days') days?: string,
  ): { success: boolean; data: EconomicEvent[]; meta: { timestamp: string; count: number } } {
    const parsedDays = days !== undefined ? parseInt(days, 10) : 30;
    const safeDays = isNaN(parsedDays) || parsedDays < 1 ? 30 : parsedDays;
    const data = this.calendarService.getUpcomingEvents(safeDays);

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        count: data.length,
      },
    };
  }

  @Get('events/all')
  @ApiOperation({ summary: '전체 경제 이벤트 조회', description: '하드코딩된 2026년 전체 경제 이벤트를 반환합니다.' })
  @ApiResponse({ status: 200, description: '전체 이벤트 목록 반환 성공' })
  getAllEvents(): { success: boolean; data: EconomicEvent[]; meta: { timestamp: string; count: number } } {
    const data = this.calendarService.getAllEvents();

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        count: data.length,
      },
    };
  }

  @Get('events/type/:type')
  @ApiOperation({ summary: '타입별 경제 이벤트 조회', description: '이벤트 타입으로 필터링하여 반환합니다.' })
  @ApiParam({
    name: 'type',
    enum: ['FOMC', 'CPI', 'NFP', 'PCE', 'KR_RATE', 'EARNINGS', 'OTHER'],
    description: '이벤트 타입',
  })
  @ApiResponse({ status: 200, description: '타입별 이벤트 목록 반환 성공' })
  getEventsByType(
    @Param('type') type: string,
  ): { success: boolean; data: EconomicEvent[]; meta: { timestamp: string; count: number } } {
    const data = this.calendarService.getEventsByType(type);

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        count: data.length,
      },
    };
  }
}
