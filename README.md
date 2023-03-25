# 🧵 Next Compose Middleware

`next-compose-middleware` is a library that simplifies building complex, declarative middleware for Next.js applications. It allows you to create highly readable and maintainable middleware by composing multiple functions together.


## 🌟 Features
- Path-based middleware execution (like "Nested Middleware")
- Composition of functions divided by interest (including early exit)

## 🔏 Requirements
Next.js v12.2.0+ (Middleware support)

## 🚀 Installation

```sh
npm install next-compose-middleware
# or
yarn add next-compose-middleware
# or
pnpm add next-compose-middleware
```

## 🐈 Usage

### Basic
```ts
export default async function middleware(req: NextRequest) {
  /**
   * Path                : Middleware execution order
   * 
   * `/`                 : root1 -> root2
   * `/foo`              : root1 -> root2 -> foo
   * `/foo/bar/hoge`     : root1 -> root2 -> foo -> fooBar
   * `/foo/bar/xxxx/baz` : root1 -> root2 -> foo -> fooId -> fooIdBaz
   */
  return composeMiddleware(req, NextResponse.next(), {
    scripts: [root1, root2],
    '/foo': {
      scripts: [foo],
      '/bar': {
        scripts: [fooBar], 
      },
      '/[id]': {
        scripts: [fooId],
        '/baz': [fooIdBaz]
      },

      // ↓ Either writing method will work, but if you want to nest more, you have to write it in the Object
      '/qux': [fooQux]
      '/qux': {
        scripts: [fooQux]
      }
    }
  })
}
```

Each middleware function is a `ComposableMiddleware` function.
It is almost identical to the Next.js middleware, except for additional arguments.

```ts
/**
 * type ComposableMiddleware = (
 *   req: NextRequest,
 *   res: NextResponse,
 *   handler?: {...} // explained at next section
 * ) => Promise<Response>;
 */
const fooMiddleware: ComposableMiddleware = async (req, res) => {
  res.cookies.set('foo', 'foo')
  return res;
};
```


### Early Exit
To abort the process at a specific middleware without executing subsequent functions, use the breakAll or breakOnce handler from the third argument.

```ts
const basicAuth: ComposableMiddleware = async (req, res, { breakAll, breakOnce }) => {
  const success = validateBasicAuth(req); // returns boolean
  if (success) {
    return res;
  } else {
    return breakAll(res); // All subsequent middleware (e.g., refreshToken, foo, etc.) will not be executed.

    // or
    return breakOnce(res); // Only subsequent middleware in the same hierarchy (e.g., refreshToken) will not be executed (foo will be executed).
  }
};

export default async function middleware(req: NextRequest) {
  return composeMiddleware(req, NextResponse.next(), {
    scripts: [basicAuth, refreshToken],
    '/foo': {
      scripts: [foo],
      ...
    }
  })
}
```
