import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog } from './activity-log.entity';

@ApiTags('Activity Logs')
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @ApiResponse({ status: 200, description: 'Return all logs.', type: [ActivityLog] })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific log entry' })
  @ApiResponse({ status: 200, description: 'Return single log.', type: ActivityLog })
  @ApiResponse({ status: 404, description: 'Log not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
