import http from 'http';

export default {
  get: async function(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
      http.get(url, res => {
        const data: any[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => {
          if (res.statusCode === 200) resolve(Buffer.concat(data));
          else reject();
        });
      });
    });
  },
  request: async function(url: string, options: http.RequestOptions, body: any) {
    return new Promise<Buffer>((resolve, reject) => {
      const client = http.request(url, options, res => {
        const data: any[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) resolve(Buffer.concat(data));
          else reject();
        });
      });
      if (body) client.end(body);
      else client.end();
    });
  },
}
