import { injectable } from 'tsyringe';

interface IPaperService {
  getLatestBuild(): Promise<PaperVersion | undefined>;
}

@injectable()
class PaperService implements IPaperService {
  async getLatestBuild(): Promise<PaperVersion | undefined> {
    const versions = await this.getVersions();

    for (let i = versions.length - 1; i >= 0; i--) {
      const response = await fetch(
        `https://api.papermc.io/v2/projects/paper/versions/${versions[i]}/builds`,
      );
      if (!response.ok)
        throw new Error(`${versions[i]}のビルドを取得できませんでした`);
      const json = await response.json();
      const builds: {
        build: string;
        time: string;
        channel: string;
        promited: string;
      }[] = json.builds;
      const succeededBuilds = builds.filter((b) => b.channel === 'default');
      if (succeededBuilds.length === 0) continue;
      return {
        buildNumber: succeededBuilds[succeededBuilds.length - 1].build,
        isSucceeded: true,
        mcVersion: versions[i],
      } as PaperVersion;
    }
    return undefined;
  }

  async getVersions(): Promise<string[]> {
    const response = await fetch('https://api.papermc.io/v2/projects/paper/');
    if (!response.ok) throw new Error('Paper Apiにアクセスできませんでした');
    const json = await response.json();
    return json.versions;
  }
}

type PaperVersion = {
  mcVersion: string;
  buildNumber: string;
  isSucceeded: boolean;
};

export { type IPaperService, PaperService };
