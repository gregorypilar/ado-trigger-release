import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const tr = new tmrm.TaskMockRunner(taskPath);

tr.setVariableName('system.collectionUri', 'https://dev.azure.com/gregorypilar/');
tr.setVariableName('system.teamProjectId', 'eShopOnWeb-Test');
tr.setVariableName('system.AccessToken', 'dcnmqsjmfbv3bglzukn6axk7jy7jgioju6xm3v3mdppjsoce32ya');

tr.run();
