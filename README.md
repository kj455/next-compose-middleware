# 🧵 Next Compose Middleware

This is a library for building Next.js complex middleware declaratively.
You can create highly readable and manageable middleware by composing multiple functions together.

## 🌟 Features
- Path-based middleware execution (like "Nested Middleware")
- Composition of functions divided by interest (including early exit)

## 🔏 Requirements
Next.js v12.2.0+ (Middleware support)

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
        '/baz': [fooIdBaz]path
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
This is almost identical to the Next.js middleware, differing only in that it takes additional arguments.

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
If you want to abort whole process at a particular middleware without executing subsequent functions, use a handler that is given from third argument.

```ts
const basicAuth: PipeableMiddleware = async (req, res, { breakAll, breakOnce }) => {
  const success = validateBasicAuth(req); // returns boolean
  if (success) {
    return res;
  } else {
    return breakAll(res); // All subsequent middleware (`refreshToken`, `foo` and others) will not be executed !!

    // or
    return breakOnce(res); //　Only subsequent middleware in the same hierarchy (`refreshToken`) will not be executed (`foo` will be executed).
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