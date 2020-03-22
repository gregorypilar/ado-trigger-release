"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ReleaseManager_1 = require("../ReleaseManager");
const tsk = require("azure-pipelines-task-lib/mock-test");
const path = require("path");
const manager = new ReleaseManager_1.default({
    azureDevOpsUri: 'https://dev.azure.com/drunkcoding/',
    pat: '3plilhh2en44cdlskecwf33u77puiznqgqyejalqd5in6tx57tha',
    projectNameOrId: 'drunkcoding.net'
});
const releaseDefinition = 40;
describe('Test trigger-release', function () {
    // before(() => {});
    // after(() => {});
    it('should succeed', function (done) {
        this.timeout(30000);
        const tp = path.join(__dirname, 'success.js');
        console.log('Test process file:', tp);
        const tr = new tsk.MockTestRunner(tp);
        tr.run();
        if (!tr.succeeded)
            console.error('Test error:', tr.errorIssues);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        done();
    });
    it('Test getReleaseDefinition func', function (done) {
        this.timeout(10000);
        manager.getReleaseDefinition(releaseDefinition).then(rs => {
            assert.equal(rs.id, releaseDefinition);
            //console.log(rs.lastRelease);
            done();
        });
    });
    it('Test reDeploy not found env func', function (done) {
        this.timeout(10000);
        manager.deploy(675, 'duy').catch(err => {
            assert.equal(err, 'The environment DUY is not found.');
            done();
        });
    });
    it('Test reDeploy dv1 func', function (done) {
        this.timeout(10000);
        manager.reDeploy(releaseDefinition, 'Nuget Internal Push').then(rs => {
            console.log(rs);
            done();
        });
    });
});