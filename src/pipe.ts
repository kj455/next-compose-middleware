import { StateHandler, stateHandler } from './state';
import { Request, Response } from './types';

export type PipeableMiddleware = (
  req: Request,
  res: Response,
  handler?: {
    breakOnce: () => void;
    breakAll: () => void;
  }
) => Promise<Response | undefined>;

type Option = {
  matcher?: (req: Request) => boolean | Promise<boolean>;
};

type Pipe = (
  req: Request,
  res: Response,
  middlewares: (PipeableMiddleware | [PipeableMiddleware, Option])[],
  stateHandler: StateHandler
) => Promise<Response>;

export const pipe: Pipe = async (req, res, middlewares, stateHandler) => {
  if (middlewares.length === 0) {
    return res;
  }
  const [next, ...rest] = middlewares;
  const [middleware, option] =
    typeof next === 'function' ? [next, null] : [next[0], next[1]];

  if (option?.matcher && !option.matcher(req)) {
    return pipe(req, res, rest, stateHandler);
  }

  const { getState, dispatch } = stateHandler;
  const result = await middleware(req, res, {
    breakOnce: () => dispatch('breakOnce'),
    breakAll: () => dispatch('breakAll'),
  });

  if (getState().brokenOnce) {
    return res;
  }
  if (result === undefined) {
    throw new Error(
      'Pipeable middleware should return a response if you want to continue the pipeline.'
    );
  }

  // before continuing, we need to reset the brokenOnce state
  dispatch('reset');
  return pipe(req, result, rest, stateHandler);
};

type PipeMiddleware = (
  req: Request,
  res: Response,
  middlewares: (PipeableMiddleware | [PipeableMiddleware, Option])[]
) => Promise<Response>;

export const pipeMiddleware: PipeMiddleware = (req, res, middlewares) =>
  pipe(req, res, middlewares, stateHandler);
