import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  let healthService: jest.Mocked<Pick<HealthCheckService, 'check'>>;
  let dbIndicator: jest.Mocked<Pick<TypeOrmHealthIndicator, 'pingCheck'>>;

  beforeEach(async () => {
    healthService = {
      check: jest.fn().mockResolvedValue({
        status: 'ok',
        info: { database: { status: 'up' } },
      }),
    };
    dbIndicator = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: HealthCheckService, useValue: healthService },
        { provide: TypeOrmHealthIndicator, useValue: dbIndicator },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('헬스체크 결과를 반환한다', async () => {
      const result = await appController.check();

      expect(healthService.check).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'ok' }));
    });
  });
});
