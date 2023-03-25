import { ComposableMiddleware } from 'next-compose-middleware';

export const decorateHeader: ComposableMiddleware = (req, res) => {
  console.log('decorateHeaderMiddleware');

  res.headers.set('x-hello-from-middleware', 'hello');
  return res;
};
