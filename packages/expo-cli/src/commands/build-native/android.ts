import { Job } from '@expo/build-tools';

import { CredentialsSource, Keystore } from '../../credentials/credentials';
import { Context } from '../../credentials/context';
import { SetupAndroidKeystore } from '../../credentials/views/SetupAndroidKeystore';
import { runCredentialsManager } from '../../credentials/route';
import prompt from '../../prompts';
import { Builder, BuilderContext } from './build';

interface Options {
  credentialsSource: CredentialsSource;
  parent?: {
    nonInteractive?: boolean;
  };
}

class AndroidBuilder implements Builder {
  constructor(public readonly ctx: BuilderContext) {}

  async ensureCredentials(): Promise<void> {
    const provider = new AndroidCredentialsProvider();
    await ensureCredentials(provider, this.ctx.eas.credentialsSource);
    this.credentials = await provider.getCredentials();
  }

  async prepareJob(archiveUrl: string): Promise<Job> {
    throw new Error('aasd');
  }
  //
  //    const keystore = await ctx.android.fetchKeystore(experienceName);
  //    await this.readCredentialsJson();
  //
  //    if (this.options.clearCredentials) {
  //      if (this.options.parent?.nonInteractive) {
  //        throw new BuildError(
  //          'Clearing your Android build credentials from our build servers is a PERMANENT and IRREVERSIBLE action, it\'s not supported when combined with the "--non-interactive" option'
  //        );
  //      }
  //      await runCredentialsManager(ctx, new RemoveKeystore(experienceName));
  //    }
  //
  //    const paramKeystore = await getKeystoreFromParams(this.options);
  //    if (paramKeystore) {
  //      await useKeystore(ctx, experienceName, paramKeystore);
  //    } else {
  //         }
  //
  //  }
  //
  //  async prepareRemote() {
  //    const ctx = new Context();
  //    await ctx.init(this.projectDir);
  //    const experienceName = `@${ctx.manifest.owner || ctx.user.username}/${ctx.manifest.slug}`;
  //
  //    await runCredentialsManager(
  //      ctx,
  //      new SetupAndroidKeystore(experienceName, {
  //        nonInteractive: this.options.parent?.nonInteractive,
  //      })
  //    );
  //
  //  }
  //
  //  async readLocal() {
  //    const credJson = credentialsJson.read(this.projectDir)
  //
  //  }
}

export { AndroidBuilder };
