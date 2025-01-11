import { drive_v3, google } from 'googleapis';
import { JWT } from 'googleapis-common';
import { Writable } from 'stream';
import { singleton } from 'tsyringe';

interface IDriveService {
  pictureGacha(writable: Writable): Promise<string>;
}

@singleton()
class DriveService implements IDriveService {
  private readonly jwtAuth: JWT;

  constructor() {
    this.jwtAuth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
    );
  }

  async pictureGacha(writable: Writable) {
    const driveApi = await this.driveApi();
    const pictures: { id: string; name: string }[] = [];
    let nextPageToken: undefined | string = undefined;
    do {
      const response = await driveApi.files.list({
        fields: 'files(id,name,fileExtension),nextPageToken',
        pageToken: nextPageToken,
        q: DriveService.queryBuilder(process.env.PICTURE_FOLDER_ID!),
      });

      if (response.status === 200 && response.data.files) {
        if (response.data.nextPageToken) {
          nextPageToken = response.data.nextPageToken as string;
        } else {
          nextPageToken = undefined;
        }
        response.data.files
          .filter(
            (data) =>
              data.id &&
              data.fileExtension &&
              ['png'].includes(data.fileExtension),
          )
          .forEach(
            (data) =>
              data.id &&
              data.name &&
              pictures.push({
                id: data.id,
                name: data.name,
              }),
          );
      }
    } while (nextPageToken);

    if (pictures.length === 0) {
      throw new Error('no pictures');
    }
    const rnd = Math.floor(Math.random() * pictures.length);

    console.log('[Drive] Start Downloading');
    return await driveApi.files
      .get(
        {
          fileId: pictures[rnd].id,
          alt: 'media',
        },
        { responseType: 'stream' },
      )
      .then((res) => {
        return new Promise<string>((resolve, reject) => {
          res.data
            .on('data', (d) => writable.write(d))
            .on('error', (err) => {
              console.error('[Drive] Downloading Error');
              reject(err);
            })
            .on('end', () => {
              writable.end();
              console.log('[Drive] Finish Downloading');
              resolve(pictures[rnd].name);
            });
        });
      });
  }

  private async driveApi(): Promise<drive_v3.Drive> {
    try {
      await this.jwtAuth.authorize();
      return google.drive({
        version: 'v3',
        auth: this.jwtAuth,
      });
    } catch (e) {
      console.log(`🧨 method: driveApi 🧨`);
      throw e;
    }
  }

  private static queryBuilder(folderId: string | null): string {
    let query = 'trashed = false';
    if (folderId) query += ` and '${folderId}' in parents`;
    return query;
  }
}

export { type IDriveService, DriveService };
