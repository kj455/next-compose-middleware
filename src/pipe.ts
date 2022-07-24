import { ComposableMiddleware } from './compose';
import { createStore, Store } from './store';
import { Request, Response } from './types';

export type PipeMiddleware = (
  req: Request,
  res: Response,
  middlewares: ComposableMiddleware[]
) => Promise<Response>;

type Pipe = (
  req: Request,
  res: Response,
  middlewares: ComposableMiddleware[],
  store: Store
) => Promise<Response>;

export const pipe: Pipe = async (req, res, middlewares, store) => {
  const [middleware, ...rest] = middlewares;
  if (middleware === undefined) {
    return res;
  }

  const { getState, dispatch } = store;
  const result = await middleware(req, res, {
    breakOnce: (res) => {
      dispatch({ type: 'breakOnce' });
      return res;
    },
    breakAll: () => {
      dispatch({ type: 'breakAll' });
      return res;
    },
  });

  const { brokenOnce, brokenAll } = getState();
  if (brokenOnce || brokenAll) {
    return result;
  }

  return pipe(req, result, rest, store);
};

/** @deprecated should use composeMiddleware */
export const pipeMiddleware: PipeMiddleware = (req, res, middlewares) => {
  const store = createStore();
  return pipe(req, res, middlewares, store);
};
