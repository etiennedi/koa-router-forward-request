# koa-router-forward-request
> Forward single routes to a different API and modify the content on the way.

* intended for use with koa-router
* forwards a request to another route or seperate API
* allows to modify both the request body, as well as the response body
* takes a configuration object
* returns a generator function to be passed router.METHOD()

# Usage

All example use a POST request, but you can specify any HTTP method you want.

## Basic Usage - A simple proxy example

The simplest example possible is to forward a request and specify which headers should be forwarded. While this example offers no additional benefit over existing koa proxy packages, it shows how to use the createForward method:

```javascript
const app = require('koa')();
const router = require('koa-router')();
const createForward = require('koa-router-forward-request');

router.post('/foo', createForward({
  request: {
    url: 'http://other-api.com/foo',
    method: 'post',
    forwardHeaders: ['authorization'],
  }
}));
  
app
.use(router.routes())
.use(router.allowedMethods());
```

It will forward any POST request made to our server on the `/foo` route to the other-api.com. Only the authorization header is passed along, other headers are ignored.

## Adding a compose method to modify the request body

Let's say you're expecting a string and want to uppercase it.

```javascript
const composeRequest = body => body.toUpperCase();

router.post('/foo', createForward({
  request: {
    url: 'http://other-api.com/foo',
    method: 'post',
    forwardHeaders: ['authorization'],
    composeBody: composeRequest
  }
}));
```

Our body will now be uppercased before it is forwarded to the foreign API. The response is still unchanged.

## Adding a compose method to modfiy the response

Now we also want to modify the response. Let's say you are expecting an array and want to uppercase each item. But what if the request fails? You don't have an array to map over then. So let's only have our compose function run on a specific status:

```javascript
const composeRequest = body => body.toUpperCase();
const composeResponse = list => list.map( item => item.toUpperCase() );

router.post('/foo', createForward({
  request: {
    url: 'http://other-api.com/foo',
    method: 'post',
    forwardHeaders: ['authorization'],
    composeBody: composeRequest
  },
  response: {
    successOnStatus: 201,
    composeBody: composeResponse
  }
}));
```

## Making additional calls 

If you need more data to compose your result, you can also make additional requests from your compose function. Just create a generator function instead of a regular function:

```javascript
const request = require('request-promise');

const composeResponse = function* (body) {
  const data1 = yield request('http://other-api.com/tomatoes')
  const data2 = yield request('http://other-api.com/potatoes')
  
  return doSomethingWithAllTheData(body, data1, data2);
}

router.post('/foo', createForward({
  request: {
    url: 'http://other-api.com/foo',
    method: 'post',
    forwardHeaders: ['authorization'],
  },
  response: {
    successOnStatus: 201,
    composeBody: composeResponse
  }
}));
```

