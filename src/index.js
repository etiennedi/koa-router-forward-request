import pathToRegexp from 'path-to-regexp';
import pick from 'lodash.pick';
import request from 'request-promise';
import { parse } from 'url';

export default config => function*() {

  // parse URL
  const paramKeys = [];

  const urlParsed = parse(config.request.url);

  pathToRegexp(urlParsed.path, paramKeys);
  const compileUrl = pathToRegexp.compile(urlParsed.path);
  const url = urlParsed.protocol + '//'
    + urlParsed.host + compileUrl(this.params);

  // pick headers
  const headers = pick(this.request.headers, config.request.forwardHeaders);

  // compose request body
  let body;
  if (config.request.composeBody) {
    const bodyParsed = this.request.body;
    body = yield config.request.composeBody(bodyParsed)
  } else {
    body = this.request.body;
  }
  body = JSON.stringify(body);

  // build request options
  const options = {
    url,
    headers,
    body,
    resolveWithFullResponse: true,
    simple: false
  };

  const res = yield request[config.request.method](options);

  // compose response body
  if (config.response && config.response.composeBody && res.statusCode === config.response.successOnStatus) {
    const body = yield JSON.parse(res.body);
    this.response.body = JSON.stringify(yield config.response.composeBody(body));
  } else {
    this.response.body = res.body;
  }

  // forward status code
  this.response.status = res.statusCode;
}

