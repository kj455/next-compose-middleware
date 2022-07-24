import type { Middleware } from './compose';
import { StateHandler, stateHandler } from './state';
import { Request, Response } from './types';

export type PipeMiddleware = (
  req: Request,
  res: Response,
  middlewares: Middleware[]
) => Promise<Response>;

type Pipe = (
  req: Request,
  res: Response,
  middlewares: Middleware[],
  stateHandler: StateHandler
) => Promise<Response>;

export const pipe: Pipe = async (req, res, middlewares, handler) => {
  const [next, ...rest] = middlewares;
  if (next === undefined) {
    return res;
  }
  const [middleware, option] =
    typeof next === 'function' ? [next, null] : [next[0], next[1]];

  if (option?.matcher && !option.matcher(req)) {
    return pipe(req, res, rest, handler);
  }

  const { getState, dispatch } = handler;
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

  return pipe(req, result, rest, handler);
};

export const pipeMiddleware: PipeMiddleware = (req, res, middlewares) =>
  pipe(req, res, middlewares, stateHandler);
