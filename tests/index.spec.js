import {expect} from 'chai';
import nock from 'nock';

import createForward from '../src/index';

const url = 'http://api.com';

describe('GET, no body, no params, no transforming', () => {
  const ctx = {
    request: {
      headers: {
        'authorization': 'foo_auth',
        'unwanted': 'ignore_me'
      }
    },
    response: {}
  };

  const forward = createForward({
    request: {
      url: url + '/foo',
      forwardHeaders: ['authorization'],
      method: 'get'
    },
  });

  describe('request', ()=> {

    afterEach(()=> {
      nock.cleanAll();
    });

    it('should forward the set headers', async () => {
      const scope = nock(url)
      .matchHeader('authorization', 'foo_auth')
      .get('/foo').reply(200);
      await forward(ctx);
      expect(scope.isDone()).to.equal(true);
    });

    it('should remove the other headers', async () => {
      const scope = nock(url, {
        badheaders: ['unwanted']
      })
        .get('/foo')
        .reply(200);
      await forward(ctx);
      expect(scope.isDone()).to.equal(true);
    })

  });

  describe('response', () => {
    before(async () => {
      nock(url, {
        reqheaders: {
          authorization: 'foo_auth',
        }
      })
        .get('/foo')
        .reply(200, 'foo');
      await forward(ctx);
    });

    after(() => {
      nock.cleanAll();
    });

    it('should forward the status from the remote request', async () => {
      expect(ctx.response.status).to.equal(200);
    });

    it('should forward the body (unchanged) from the remote request', async () => {
      expect(ctx.response.body).to.equal('foo');
    });
  });
});
