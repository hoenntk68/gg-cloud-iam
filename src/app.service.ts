import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import ResourceManagerClient, {
  ProjectsClient,
} from '@google-cloud/resource-manager';
import { google, iam_v1 } from 'googleapis';
import * as fs from 'fs';
import { GoogleConnectorConfig as GoogleConnectorConfig } from './dtos/gg-config';
import { GoogleAuth } from 'google-auth-library';
import { RoleRequestDto } from './dtos/role-request.dto';

export const GOOGLE_APPLICATION_CREDENTIALS =
  './huyendemok8s-bef4a9b0fe97.json';

@Injectable()
export class AppService {
  // private readonly iamClient: iam_v1.Iam;
  private readonly projectClient: ProjectsClient;
  constructor() {
    // this.iamClient = google.iam('v1');
    this.projectClient = new ResourceManagerClient.ProjectsClient();
  }
  async readPolicy() {
    try {
      // const actk = await google.auth.getClient();
      const projectId = 'huyendemok8s';
      const member = 'user:huyenntk@sonat.vn';
      const role = 'roles/logging.logWriter';

      let policy = await this.getPolicy(projectId);
      let bindings = policy[0].bindings.filter((item) => item.role == role);
      if (bindings.length > 0) {
        const binding = bindings[0];
        if (binding) {
          binding.members.push(member);
        }
      } else {
        policy[0].bindings.push({
          role: role,
          members: [member],
        });
      }
      // const setPolicyResponse = await this.setPolicy(projectId, policy[0]);
      return null;
    } catch (e) {
      Logger.log(e.errors);
      throw e;
    }
  }

  async getPolicy(projectId: string) {
    const policy = await this.projectClient.getIamPolicy({
      resource: `projects/${projectId}`,
    });
    return policy;
  }

  async setPolicy(projectId: string, policy: any) {
    try {
      const res = await this.projectClient.setIamPolicy({
        policy: policy,
        resource: `projects/${projectId}`,
      });
      return res;
    } catch (e) {
      Logger.log(e.errors);
      throw e;
    }
  }

  async revokeRole(request: RoleRequestDto) {
    const projectId = request.projectId;
    const member = request.member;
    const role = request.role;
    let policy = await this.getPolicy(projectId);
    let bindings = policy[0].bindings.filter((item) => item.role == role);
    if (bindings.length > 0) {
      let binding = bindings[0];
      if (binding.members.includes(member)) {
        binding.members = binding.members.filter((x) => x != member);
        policy[0].bindings = policy[0].bindings.map((item) => {
          if (item.role == role) {
            return binding;
          } else {
            return item;
          }
        });
      } else {
        throw new BadRequestException(
          `The member ${member} has not been granted the role ${role}`,
        );
      }
    } else {
      throw new BadRequestException(`No such role in project ${projectId}`);
    }
    return await this.setPolicy(projectId, policy[0]);
  }

  async grantRole(request: RoleRequestDto) {
    const projectId = request.projectId;
    const member = request.member;
    const role = request.role;
    let policy = await this.getPolicy(projectId);
    let bindings = policy[0].bindings.filter((item) => item.role == role);
    if (bindings.length > 0) {
      const binding = bindings[0];
      if (binding) {
        binding.members.push(member);
      }
    } else {
      policy[0].bindings.push({
        role: role,
        members: [member],
      });
    }
    const setPolicyResponse = await this.setPolicy(projectId, policy[0]);
    return setPolicyResponse;
  }

  async getAuthToken(): Promise<GoogleAuth> {
    if (fs.existsSync(GOOGLE_APPLICATION_CREDENTIALS)) {
      const config: GoogleConnectorConfig = JSON.parse(
        fs.readFileSync(GOOGLE_APPLICATION_CREDENTIALS, 'utf8'),
      );
      return new google.auth.GoogleAuth({
        credentials: {
          client_email: config.client_email,
          private_key: config.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/iam'],
      });
    } else {
      throw new BadRequestException('No Google connector found');
    }
  }
}
