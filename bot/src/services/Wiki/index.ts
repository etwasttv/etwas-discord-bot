import { injectable } from 'tsyringe';

interface IWikiService {
  getThumbnail(title: string): Promise<string>;
  getDescription(title: string): Promise<string>;
}

const DESCRIPTION_ENDPOINT = 'https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=';
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
    const result = await fetch(DESCRIPTION_ENDPOINT + title);

    if (!result.ok)
      return '';

    const data = await result.json();

    for (let id in data.query.pages) {
      return data.query.pages[id].extract;
    }

    throw new Error('No Description');
  }
}

export { type IWikiService, WikiService }
