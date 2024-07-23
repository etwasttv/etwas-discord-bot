import { injectable } from 'tsyringe';

interface IWikiService {
  getThumbnail(title: string): Promise<string>;
  getDescription(title: string): Promise<string>;
}

const THUMBNAIL_ENDPOINT = 'https://ja.wikipedia.org/api/rest_v1/page/summary/';
@injectable()
class WikiService implements IWikiService {
  async getThumbnail(title: string): Promise<string> {
    const result = await fetch(THUMBNAIL_ENDPOINT + title);

    if (!result.ok)
      return '';

    const data = await result.json();

    return data.thumbnail.source;
  }

  async getDescription(title: string): Promise<string> {
    const result = await fetch(THUMBNAIL_ENDPOINT + title);

    if (!result.ok)
      return '';

    const data = await result.json();

    return data.extract;
  }
}

export { type IWikiService, WikiService }
