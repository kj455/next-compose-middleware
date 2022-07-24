# 🧵 Next Pipe Middleware

This is a library for building Next.js complex middleware declaratively.
You can create highly readable and manageable middleware by composing multiple functions together.


## 🌟 Features
- Path-based middleware execution (like "Nested Middleware")
- Composition of functions divided by interest (including early exit)

## 🔏 Requirements
Next.js v12.2.0+ (Middleware support)

## 🐈 Usage

### Basic
Pass NextRequest, NextResponse, and arrays of multiple middleware to `pipeMiddleware` function.

```ts
export default async function middleware(req: NextRequest) {
  return pipeMiddleware(req, NextResponse.next(), [
    fooMiddleware,
    barMiddleware,
    hogeMiddleware,
  ])
}
```

Each middleware function (`PipeableMiddleware`) differs from the Next.js middleware functions only in that it takes a NextResponse as its second argument:

```ts
const fooMiddleware: PipeableMiddleware = async (req, res) => {
  res.cookies.set('foo', 'bar')
  return res;
};
```

### Conditional middleware
If you want to control execution of middleware according to the page path, pass an object containing a matcher function as the second element of the tuple

```ts
export default async function middleware(req: NextRequest) {
  return pipeMiddleware(req, NextResponse.next(), [
    basicAuthMiddleware,
    [redirectMiddleware, {matcher: (path) => path.startsWith('/secret')}],
    [refreshTokenMiddleware, {matcher: (path) => path.startsWith('/my')}],
  ])
}
```

### Terminable middleware
If you want to terminate the entire process on a particular piece of middleware (i.e., you do not want subsequent pieces of middleware to run), change the response format as follows

```ts
const basicAuth: PipeableMiddleware = async (req, res) => {
  const success = validateBasicAuth(req);
  if (success) {
    return res;
  } else {
    return {
      res: NextResponse.rewrite(/**/),
      final: true,
    }; // terminate process after this middleware by returning object with `final: true` and `res`
  }
};

export default async function middleware(req: NextRequest) {
  return pipeMiddleware(req, NextResponse.next(), [
    basicAuthMiddleware, // if basic auth failed, the process ends here.
    redirectMiddleware,
    refreshTokenMiddleware
  ])
}
```


## 📖 Appendix

[Demo](https://codesandbox.io/s/next-pipe-middleware-w9rvlh?file=/middleware.ts)

<details>
<summary>Motivation</summary>

If you want to implement the following at the middleware file:
- Applying Basic-auth, if it fails, **terminates** at that point.
- If user access to specific page, redirect and **terminates** at that point.
- Refresh the authentication token.

Without this library, you would have to write codes like this:
```ts
export default async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const success = await basicAuthMiddleware(req, res);
  if (!success) {
    return NextResponse.rewrite(new URL('/api/basic-auth', req.url))
  }

  if (req.url.startsWith('/secret')) {
    const [shouldRedirect, redirectRes] = await redirectMiddleware(req, res);
    if (shouldRedirect) {
      return redirectRes;
    }
  }

  if (req.url.startsWith('/my')) {
    await refreshTokenMiddleware(req, res);
  }
  return res;
}
```

It is difficult to know what kind of process the middleware consists of, because it is necessary to check whether the process should be terminated depending on the response, or whether it should be executed according to the path, etc.

This library allows you to write what you want to do declaratively and readably as above.
</details>