import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';


// test case for workspace 
describe('WorkspaceService', () => {
  let service: WorkspaceService;
// before each does  the setup work
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceService],
    }).compile();
// service check through module space
    service = module.get<WorkspaceService>(WorkspaceService);
  });
// it checks the condition defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
