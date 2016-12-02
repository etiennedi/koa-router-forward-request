import mocha from 'mocha';
import coMocha from 'co-mocha';
import {expect} from 'chai';
import nock from 'nock';

import createForward from '../src/index';

coMocha(mocha);

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

    it('should forward the set headers', function* () {
      const scope = nock(url)
      .matchHeader('authorization', 'foo_auth')
      .get('/foo').reply(200);
      yield forward.call(ctx);
      expect(scope.isDone()).to.equal(true);
    });

    it('should remove the other headers', function* () {
      const scope = nock(url, {
        badheaders: ['unwanted']
      })
        .get('/foo')
        .reply(200);
      yield forward.call(ctx);
      expect(scope.isDone()).to.equal(true);
    })

  });

  describe('response', () => {
    before(function*() {
      nock(url, {
        reqheaders: {
          authorization: 'foo_auth',
        }
      })
        .get('/foo')
        .reply(200, 'foo');
      yield forward.call(ctx);
    });

    after(() => {
      nock.cleanAll();
    });

    it('should forward the status from the remote request', function*() {
      expect(ctx.response.status).to.equal(200);
    });

    it('should forward the body (unchanged) from the remote request', function*() {
      expect(ctx.response.body).to.equal('foo');
    });
  });

})