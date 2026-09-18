import { Controller, Get, Body, Patch } from '@nestjs/common';
import { RedocExcludeController } from 'src/common/decorators/exclude-from-redoc.decorator';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { AppConfigApiDashboardService } from './app-config-api-dashboard.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/common/decorators/authentication.decorator';

@Controller('dashboard/appConfig')
@RedocExcludeController()
@ApiTags('Dashboard - AppConfig')
@AuthenticationGuard('Account')
export class AppConfigApiDashboardController {
  constructor(
    private readonly appConfigService: AppConfigApiDashboardService,
  ) { }

  @Get()
  findOne() {
    return this.appConfigService.findOne();
  }

  @Patch()
  update(@Body() data: UpdateAppConfigDto) {
    return this.appConfigService.update(data);
  }
}
