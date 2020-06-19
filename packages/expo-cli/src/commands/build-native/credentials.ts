import { CredentialsSource, Keystore } from '../../credentials/credentials';
import { BuilderContext } from './build';

interface CredentialsProvider {
  hasRemote(): Promise<boolean>;
  hasLocal(): Promise<boolean>;
  useRemote(): Promise<void>;
  useLocal(): Promise<void>;
  isLocalSynced(): Promise<boolean>;
  updateLocal(): Promise<void>;
}

async function ensureCredentials(
  provider: CredentialsProvider,
  ctx: BuilderContext
): Promise<void> {
  const src = ctx.eas.credentialsSource;
  if (src === CredentialsSource.LOCAL) {
    await provider.useLocal();
  } else if (src === CredentialsSource.REMOTE) {
    await provider.useRemote();
  } else if (ctx.eas.workflow === 'managed') {
    if (await provider.hasLocal()) {
      await provider.useLocal();
    } else {
      await provider.useRemote();
    }
  } else if (ctx.eas.workflow === 'generic') {
    const hasLocal = await provider.hasLocal();
    const hasRemote = await provider.hasRemote();
    if (hasRemote && hasLocal) {
      if (!(await provider.isLocalSynced())) {
        const { confirm } = prompt({
          type: 'confirm',
          name: 'confirm',
        });
        if (confirm) {
          await provider.updateLocal();
          await provider.useRemote();
        } else {
          // promp local vs remote
          if (src === 'local') {
            await provider.useLocal();
          } else {
            await provider.useRemote();
          }
        }
      }
    }
  }
}
