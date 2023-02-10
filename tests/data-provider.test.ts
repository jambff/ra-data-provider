import nock from 'nock';
import { createDataProvider } from '../src';

const apiBaseUrl = 'http://api.com';

nock.disableNetConnect();

nock(apiBaseUrl)
  .defaultReplyHeaders({
    'access-control-allow-origin': '*',
    'access-control-allow-credentials': 'true',
  })
  .persist()
  .get('/resource')
  .query(true)
  .reply(200, {
    items: [{ title: 'Item one' }],
    total: 1,
  });

describe('Data Provider', () => {
  it('gets a list', async () => {
    const dataProvider = createDataProvider(apiBaseUrl);

    const result = await dataProvider.getList('resource', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'somefield', order: 'asc' },
      filter: {},
    });

    expect(result).toEqual({
      data: [{ title: 'Item one' }],
      total: 1,
    });
  });
});
