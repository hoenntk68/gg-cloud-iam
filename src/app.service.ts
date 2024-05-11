import { Inject, Injectable, Logger } from '@nestjs/common';
import { resourcesettings_v1 } from 'googleapis';
import ResourceManagerClient from '@google-cloud/resource-manager';
import { GoogleApis, google } from 'googleapis';
import IAM, { PoliciesClient } from '@google-cloud/iam';

export const GOOGLE_APPLICATION_CREDENTIALS =
  './huyendemok8s-bef4a9b0fe97.json';

@Injectable()
export class AppService {
  constructor() {}
  async readPolicy() {
    try {
      const actk = await google.auth.getClient();
      const projectClient = new ResourceManagerClient.ProjectsClient();
      const projectId = 'huyendemok8s';
      // const policy = await projectClient.getIamPolicy({
      //   resource: `projects/${projectId}`,
      // });
      // policy[0].bindings;
      const iamClient = google.iam('v1');
      // const roles = await iamClient.projects.roles.list({
      //   auth: actk,
      //   parent: `projects/${projectId}`,
      // });
      const testablePermissions =
        await iamClient.permissions.queryTestablePermissions({
          requestBody: {
            fullResourceName: `//cloudresourcemanager.googleapis.com/projects/${projectId}`,
          },
          auth: actk,
        });
      return { testablePermissions };
    } catch (e) {
      Logger.log(e.errors);
      throw e;
    }
  }

  async grantRole(projectId: string, member: string, role: string) {
    // await new
  }
}
