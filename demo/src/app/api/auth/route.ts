export async function GET() {
  return new Response('Invalid username or password', {
    status: 401,
    headers: {
      'WWW-authenticate': 'Basic realm="Secure Area"',
    },
  });
}
