import * as minimatch from "minimatch";

import {
  EnvironmentStatus,
  Release,
  ReleaseDefinition,
  ReleaseEnvironment,
  ReleaseStatus,
} from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";

export interface Options {
  azureDevOpsUri: string;
  projectNameOrId: string;
  /** Personal Access Token */
  pat: string;
}
export interface IReleaseManager {
  /** Get a Release definition by Id */
  getReleaseDefinition: (id: number) => Promise<ReleaseDefinition>;
  /** Get a Release by Id */
  getRelease: (id: number) => Promise<Release>;
  /** Re-deploy a Release */
  deploy: (
    release: Release | number,
    env: string
  ) => Promise<ReleaseEnvironment>;

  /** Re-deploy the last deployment of a Release Definition */
  reDeploy: (
    releaseDefinitionId: number,
    env: string
  ) => Promise<ReleaseEnvironment>;

  /** Re-deploy the last deployment of a Release Definition  for the previews release*/
  reDeployPrevious: (
    releaseDefinitionId: number,
    env: string
  ) => Promise<ReleaseEnvironment>;
}

export default class implements IReleaseManager {
  private _api!: WebApi;
  private _releaseApi!: IReleaseApi;

  constructor(private options: Options) {}

  private async getApi() {
    if (this._api) return this._api;

    const authHandler = getPersonalAccessTokenHandler(this.options.pat);
    this._api = new WebApi(this.options.azureDevOpsUri, authHandler);

    const connData = await this._api.connect();
    console.log(
      `Connected using: ${
        connData.authenticatedUser.customDisplayName ||
        connData.authenticatedUser.providerDisplayName
      }.`
    );

    return this._api;
  }

  private async getReleaseApi() {
    if (this._releaseApi) return this._releaseApi;
    const api = await this.getApi();
    this._releaseApi = await api.getReleaseApi();
    return this._releaseApi;
  }

  private async getReleaseHistory(releaseDefinitionId: number, envId: number) {
    const api = await this.getReleaseApi();
    return await api.getReleases(
      this.options.projectNameOrId,
      releaseDefinitionId,
      envId,
      null,
      null,
      ReleaseStatus.Active,
      EnvironmentStatus.Succeeded
    );
  }

  public async getReleaseDefinition(id: number) {
    const api = await this.getReleaseApi();
    return await api.getReleaseDefinition(this.options.projectNameOrId, id);
  }

  public async getRelease(id: number) {
    const api = await this.getReleaseApi();
    const release = await api.getRelease(this.options.projectNameOrId, id);
    return release;
  }

  public async deploy(release: Release | number, env: string) {
    env = env.toLowerCase();
    const api = await this.getReleaseApi();
    const item =
      typeof release === "number" ? await this.getRelease(release) : release;

    if (!item) throw `The release ${release} is not found.`;

    //Find environment
    const environment = item.environments.find((e) =>
      minimatch(e.name.toLowerCase(), env)
    );
    if (!environment)
      throw `The environment ${env.toUpperCase()} is not found.`;

    //Re-deploy the Release
    return api.updateReleaseEnvironment(
      {
        comment: `Re-deploy the ${environment.name}`,
        status: EnvironmentStatus.InProgress,
      },
      this.options.projectNameOrId,
      item.id,
      environment.id
    );
  }

  public async reDeploy(releaseDefinitionId: number, env: string) {
    const definition = await this.getReleaseDefinition(releaseDefinitionId);
    if (!definition)
      throw `Release defintion ${releaseDefinitionId} is not found.`;
    return this.deploy(definition.lastRelease.id, env);
  }

  public async reDeployPrevious(releaseDefinitionId: number, env: string) {
    const definition = await this.getReleaseDefinition(releaseDefinitionId);

    var stage = definition.environments.find(
      (e) => e.name.toLowerCase() === env.toLowerCase()
    );

    if (!definition)
      throw `Release defintion ${releaseDefinitionId} is not found.`;
    if (!stage)
      throw `Stage ${env} does not exit on Release defintion ${releaseDefinitionId} `;

    var history = await this.getReleaseHistory(definition.id, stage.id);
    var oldReleases = history.filter((e) => e.id !== definition.lastRelease.id);

    return this.deploy(definition.lastRelease.id, stage.name);
  }
}
