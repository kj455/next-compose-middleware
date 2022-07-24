import { findPathValue, getDividedPaths, Path, toPath } from './path';
import { pipe } from './pipe';
import { createStore, Store } from './store';
import { Request, Response } from './types';

type ComposeMiddleware = (
  req: Request,
  res: Response,
  option: ComposeOption
) => Promise<Response>;

export type ComposeOption = {
  scripts: ComposableMiddleware[];
  [path: Path]: ComposableMiddleware[] | ComposeOption;
};

export type ComposableMiddleware = (
  req: Request,
  res: Response,
  handler?: {
    breakOnce: (res: Response) => Response;
    breakAll: (res: Response) => Response;
  }
) => Promise<Response>;

type Compose = (
  req: Request,
  res: Response,
  option: ComposeOption,
  store: Store
) => Promise<Response>;

export const composeMain: Compose = async (req, res, option, store) => {
  const { scripts, ...pathMap } = option;

  const result = await pipe(req, res, scripts, store);

  const { brokenAll, path } = store.getState();
  if (brokenAll) {
    return result;
  }

  const [nextPath, ...restPath] = path;
  if (nextPath === undefined) {
    return result;
  }

  const nextValue = findPathValue(pathMap, toPath(nextPath));
  if (nextValue === null) {
    return result;
  }

  const isMiddlewareArray = 'length' in nextValue;
  if (isMiddlewareArray) {
    return pipe(req, res, nextValue, store);
  }

  store.dispatch({ type: 'setPath', payload: restPath });
  return composeMain(req, result, nextValue, store);
};

export const compose: Compose = async (req, res, option, store) => {
  store.dispatch({
    type: 'setPath',
    payload: getDividedPaths(req.nextUrl.pathname),
  });
  return composeMain(req, res, option, store);
};

export const composeMiddleware: ComposeMiddleware = (req, res, option) => {
  const store = createStore();
  return compose(req, res, option, store);
};
