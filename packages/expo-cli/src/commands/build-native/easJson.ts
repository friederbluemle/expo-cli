import path from 'path';

import Joi from '@hapi/joi';
import { Platform } from '@expo/build-tools';
import fs from 'fs-extra';

import { CredentialsSource } from '../../credentials/credentials';

interface CliParams {
  platform?: string;
  buildType?: string;
  credentialsSource?: string;
  buildCommand?: string;
  artifactPath?: string;
}

interface AndroidManagedOptions {
  buildType?: 'app-bundle' | 'apk';
}

interface AndroidGenericOptions {
  buildCommand?: string;
  artifactPath?: string;
}

interface iOSManagedOptions {
  buildType?: 'archive' | 'simulator';
}

export interface EasJson {
  workflow: 'generic' | 'managed';
  credentialsSource: CredentialsSource;
  android?: AndroidManagedOptions | AndroidGenericOptions;
  ios?: iOSManagedOptions;
}

export const EasJsonSchema = Joi.object({
  workflow: Joi.string().valid('managed', 'generic').required(),
})
  .when(Joi.object({ workflow: 'generic' }), {
    then: Joi.object({
      android: Joi.object({
        buildCommand: Joi.string(),
        artifactPath: Joi.string(),
      }),
      ios: Joi.object({}),
    }),
  })
  .when(Joi.object({ workflow: 'managed' }), {
    then: Joi.object({
      android: Joi.object({
        buildType: Joi.string(),
      }),
      ios: Joi.object({
        buildType: Joi.string(),
      }),
    }),
  });

export class EasJsonReader {
  private params?: CliParams;

  constructor(private projectDir: string) {}

  public withCliParams(params: CliParams): EasJsonReader {
    this.params = params;
    return this;
  }

  public async read() {
    let eas = await this.readFile();
    if (this.params) {
      eas = this.validateAndApplyParams(eas);
    }
    return eas;
  }

  private validateAndApplyParams(originalEasJson: EasJson): EasJson {
    const workflow = originalEasJson.workflow;
    const { platform, buildType, credentialsSource, buildCommand, artifactPath } =
      this.params ?? {};
    if (!platform || !['android', 'ios', 'all'].includes(platform)) {
      throw new Error('Param -p --platform is required, pass valid platform: [android|ios|all]');
    }
    if (
      platform === 'all' &&
      [buildType, buildCommand, artifactPath].filter(i => i != undefined).length != 0
    ) {
      throw new Error(
        'Platform and workflow specific options are not supported when building with --platform=all'
      );
    }
    if (credentialsSource && !['local', 'remote', 'auto'].includes(credentialsSource)) {
      throw new Error('Param --credentials-source accepts only [local|remote|auto]');
    }
    if (buildType && platform === Platform.Android) {
      if (!['apk', 'app-bundle'].includes(buildType)) {
        throw new Error('Param --build-type accepts only [apk|app-bundle] for Android builds');
      }
    } else if (buildType && platform === Platform.iOS) {
      if (!['apk', 'app-bundle'].includes(buildType)) {
        throw new Error('Param --build-type accepts only [archive|simulator] for iOS builds');
      }
    } else if (buildType && workflow !== 'managed') {
      throw new Error('Param --build-type is supported only for managed workflow');
    }
    return originalEasJson;
  }

  private validateEasJson(eas: object): EasJson {
    const { value, error } = EasJsonSchema.validate(eas, {
      stripUnknown: true,
      convert: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`eas.json is not valid [${error.toString()}]`);
    }
    return value;
  }

  private async readFile(): Promise<EasJson> {
    const rawFile = await fs.readFile(path.join(this.projectDir, 'eas.json'), 'utf-8');
    const json = JSON.parse(rawFile);
    return this.validateEasJson(json);
  }
}
