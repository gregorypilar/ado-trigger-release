import * as task from 'vsts-task-lib/task';

import ReleaseManager, { Options } from './ReleaseManager';

export interface ReplacePattern {
  from: string;
  to: string;
}

async function run() {
  console.log('Running trigger-release');

  try {
    const releaseDefinitionId = task.getInput('TargetDefinition', true);
    const environments = task.getInput('releaseStagesInput', true).split(',');
    const triggerPreviousRelease = task.getBoolInput('triggerPreviousRelease', false);

    const options: Options = {
      azureDevOpsUri: task.getVariable('system.TeamFoundationServerUri'),
      projectNameOrId: task.getVariable('system.teamProject'),
      pat: task.getVariable('system.AccessToken')
    };

    const manager = new ReleaseManager(options);

    let hasError = false;
    //Try to deploy all environments.
    environments.forEach(async env => {
      try {
        if(triggerPreviousRelease) {
          const rs = await manager.reDeployPrevious(Number(releaseDefinitionId), env);
          console.log(`The ${rs.name} of ${rs.releaseDefinition.name} had been scheduled.`);
          }
        else{
          const rs = await manager.reDeploy(Number(releaseDefinitionId), env);
          console.log(`The ${rs.name} of ${rs.releaseDefinition.name} had been scheduled.`);
        }

      } catch (ex) {
        console.error(ex);
        hasError = true;
      }
    });

    if (hasError)
      task.setResult(task.TaskResult.Failed, 'The release tasks had failed with some errors.', true);
    else task.setResult(task.TaskResult.Succeeded, '', true);
  } catch (err) {
    console.error(err);
    task.setResult(task.TaskResult.Failed, err);
  }
}

run();
