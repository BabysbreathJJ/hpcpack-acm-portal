import { DeploymentModule } from './deployment.module';

describe('DeploymentModule', () => {
  let deploymentModule: DeploymentModule;

  beforeEach(() => {
    deploymentModule = new DeploymentModule();
  });

  it('should create an instance', () => {
    expect(deploymentModule).toBeTruthy();
  });
});
