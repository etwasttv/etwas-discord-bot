import httpAsync from '@/core/httpAsync';

type Speakers = {
  name: string;
  speaker_uuid: string;
  styles: {
    name: string;
    id: number;
    type: string;
  }[];
}[];

async function getSpeakers() {
  const response = await httpAsync.request(
    `${process.env.VOICEVOX_ENDPOINT!}/speakers`,
    {
      method: 'GET',
    },
    '',
  );

  const speakers: Speakers = JSON.parse(response.toString());

  return speakers;
}

async function generateVoice(
  query: Buffer,
  spakerId: number,
  speedScale: number,
): Promise<Buffer> {
  const queryObject = JSON.parse(query.toString());
  queryObject['speedScale'] = speedScale;
  const requestQuery = Buffer.from(JSON.stringify(queryObject));
  return httpAsync.request(
    `${process.env.VOICEVOX_ENDPOINT!}/synthesis?speaker=${spakerId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestQuery),
      },
    },
    requestQuery,
  );
}

async function generateQuery(text: string, speakerId: number) {
  return httpAsync.request(
    `${process.env.VOICEVOX_ENDPOINT!}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`,
    {
      method: 'POST',
    },
    null,
  );
}

export { generateQuery, generateVoice, getSpeakers };
