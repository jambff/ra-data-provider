import nock from 'nock';
import unfetch from 'unfetch';
import { createDataProvider } from '../src';

jest.mock('unfetch', () =>
  jest.fn(async (...args) => jest.requireActual('unfetch')(...args)),
);

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
  })
  .get('/resource/1')
  .query(true)
  .reply(200, { title: 'Item one' });

describe('Data Provider', () => {
  describe('getList', () => {
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

      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith(
        'http://api.com/resource?limit=25&offset=0&sort[somefield]=asc',
      );
    });
  });

  describe('getOne', () => {
    it('gets one item', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.getOne('resource', { id: 1 });

      expect(result).toEqual({ data: { title: 'Item one' } });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith('http://api.com/resource/1');
    });

    it('gets one item with includes', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.getOne('resource', {
        id: 1,
        meta: { include: { foo: true, bar: ['baz'] } },
      });

      expect(result).toEqual({ data: { title: 'Item one' } });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith(
        'http://api.com/resource/1?include[foo]=true&include[bar][]=baz',
      );
    });
  });

  describe('getMany', () => {
    it('gets many items', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.getMany('resource', { ids: [1, 2, 3] });

      expect(result).toEqual({ data: [{ title: 'Item one' }] });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith(
        'http://api.com/resource?id[]=1&id[]=2&id[]=3',
      );
    });
  });
});
