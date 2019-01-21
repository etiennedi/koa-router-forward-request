import pathToRegexp from 'path-to-regexp';
import pick from 'lodash.pick';
import request from 'request-promise';
import { parse } from 'url';

export default config => async function (ctx) {
  // parse URL
  const paramKeys = [];

  const urlParsed = parse(config.request.url);

  pathToRegexp(urlParsed.path, paramKeys);
  const compileUrl = pathToRegexp.compile(urlParsed.path);
  const url = urlParsed.protocol + '//'
      + urlParsed.host + compileUrl(ctx.params);

  // pick headers
  const headers = pick(ctx.request.headers, config.request.forwardHeaders);

  // compose request body
  let body;
  if (config.request.composeBody) {
    const bodyParsed = ctx.request.body;
    body = await config.request.composeBody(bodyParsed);
  } else {
    body = ctx.request.body;
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

  const res = await request[config.request.method](options);

  // compose response body
  if (config.response && config.response.composeBody && res.statusCode === config.response.successOnStatus) {
    body = await JSON.parse(res.body);
    ctx.response.body = JSON.stringify(await config.response.composeBody(body));
  } else {
    ctx.response.body = res.body;
  }

  // forward status code
  ctx.response.status = res.statusCode;
};
