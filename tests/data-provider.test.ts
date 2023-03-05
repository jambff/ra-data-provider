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
  .post('/resource')
  .reply(201, { title: 'Item one' })
  .get('/resource/1')
  .query(true)
  .reply(200, { title: 'Item one' })
  .options('/resource/1')
  .reply(200)
  .put('/resource/1')
  .reply(200, { title: 'Item one' });

describe('Data Provider', () => {
  describe('getList', () => {
    it('gets a list', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.getList('resource', {
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'somefield', order: 'asc' },
        filter: { id: 1 },
      });

      expect(result).toEqual({
        data: [{ title: 'Item one' }],
        total: 1,
      });

      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith(
        'http://api.com/resource?limit=25&offset=0&sort[somefield]=asc&filter[id]=1',
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

  describe('getManyReference', () => {
    it('gets many references', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.getManyReference('resource', {
        target: 'sometarget',
        id: 1,
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'somefield', order: 'asc' },
        filter: { id: 1 },
      });

      expect(result).toEqual({ data: [{ title: 'Item one' }], total: 1 });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith(
        'http://api.com/resource?limit=25&offset=0&sort[somefield]=asc&filter[id]=1',
      );
    });
  });

  describe('create', () => {
    it('creates an item', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.create('resource', {
        data: { foo: 'bar' },
      });

      expect(result).toEqual({ data: { title: 'Item one' } });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith('http://api.com/resource', {
        method: 'POST',
        body: JSON.stringify({ foo: 'bar' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('update', () => {
    it('updates an item', async () => {
      const dataProvider = createDataProvider(apiBaseUrl);

      const result = await dataProvider.update('resource', {
        id: 1,
        data: { foo: 'bar' },
        previousData: { foo: 'baz' },
      });

      expect(result).toEqual({ data: { title: 'Item one' } });
      expect(unfetch).toHaveBeenCalledTimes(1);
      expect(unfetch).toHaveBeenCalledWith('http://api.com/resource/1', {
        method: 'PUT',
        body: JSON.stringify({ foo: 'bar' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});
