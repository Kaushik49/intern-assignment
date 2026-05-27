import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './workspace.controller';

// test ofr workspace controller
describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // import controllers
      controllers: [WorkspaceController],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });
// test for defined 
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
