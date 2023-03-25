import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ComposableMiddleware,
  composeMiddleware,
} from 'next-compose-middleware';
import { decorateHeader } from './middlewares/decorateHeader';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

const fooMiddleware: ComposableMiddleware = (req, res) => {
  console.log('fooMiddleware');
  return res;
};

const fooIdMiddleware: ComposableMiddleware = (req, res) => {
  console.log('fooIdMiddleware');
  return res;
};

const barMiddleware: ComposableMiddleware = (req, res) => {
  console.log('barMiddleware');
  return res;
};

export function middleware(req: NextRequest) {
  console.log(req.url);
  console.log('middleware!!!!!!!!');
  return composeMiddleware(req, NextResponse.next(), {
    scripts: [
      decorateHeader,
      // uncomment this line to enable basic auth
      // basicAuth,
    ],
    '/foo': {
      scripts: [fooMiddleware],
      '/bar': {
        scripts: [barMiddleware],
      },
      '/[id]': {
        scripts: [fooIdMiddleware],
      },
    },
  });
}
