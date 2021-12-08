import * as assert from 'assert';
import * as minimatch from 'minimatch';

import ReleaseManager from '../ReleaseManager';

import tsk = require('azure-pipelines-task-lib/mock-test');

import path = require('path');

const manager = new ReleaseManager({
  azureDevOpsUri: 'https://dev.azure.com/gregorypilar/',
  pat: 'dcnmqsjmfbv3bglzukn6axk7jy7jgioju6xm3v3mdppjsoce32ya',
  projectNameOrId: 'eShopOnWeb-Test'
});

const releaseDefinition = 1;

describe('Test trigger-release', function() {
 

  it('Test getReleaseDefinition func', function(done: Mocha.Done) {
    this.timeout(10000);

    manager.getReleaseDefinition(releaseDefinition).then(rs => {
      assert.equal(rs.id, releaseDefinition);
      console.log(rs.lastRelease);
      done();
    });
  });

  it('Test reDeploy not found env func', function(done: Mocha.Done) {
    this.timeout(10000);

    manager.deploy(22, 'Stage 1').catch(err => {
      assert.equal(err, 'The environment Stage 1 is not found.');
      done();
    });
  });

  it('Test reDeploy dv1 func', function(done: Mocha.Done) {
    this.timeout(10000);

    manager.reDeploy(releaseDefinition, 'Stage 1').then(rs => {
      console.log(rs);
      done();
    });
  });


  it('Test reDeployPrevious dv1 func', function(done: Mocha.Done) {
    this.timeout(1000000000000);

    manager.reDeployPrevious(releaseDefinition, 'Stage 1').then(rs => {
      console.log(rs);
      done();
    });
  });
 
});
