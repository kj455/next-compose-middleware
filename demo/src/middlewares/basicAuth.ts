import { ComposableMiddleware } from 'next-compose-middleware';
import { NextResponse } from 'next/server';

const USER_NAME = 'username';
const PASSWORD = 'password';

export const basicAuth: ComposableMiddleware = (req, res) => {
  console.log('basicAuthMiddleware');

  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

    if (user === USER_NAME && pwd === PASSWORD) {
      return NextResponse.next();
    }
  }
  url.pathname = '/api/auth';

  return NextResponse.rewrite(url);
};
