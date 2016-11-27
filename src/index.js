const createForward = config => function* () {

  console.log(this.params);

  // parse URL
  const paramKeys = [];
  pathToRegexp(config.request.url, paramKeys);
  const compileUrl = pathToRegexp.compile(config.request.url);
  const url = compileUrl(this.params);

  // pick headers
  const headers = pick(this.request.headers, config.request.forwardHeaders);

  // build request options
  const options = {
    url,
    headers,
    resolveWithFullResponse: true,
    simple: false
  };

  const res = yield request.get(options);

  if (res.statusCode === config.response.successOnStatus) {
    const body = yield JSON.parse(res.body);
    this.response.body = yield config.response.composeBody(body);
  } else {
    this.response.body = res.body;
  }

  this.response.status = res.statusCode;

}

