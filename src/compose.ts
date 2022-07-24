import { MiddlewareArgType, pipe } from './pipe';
import { stateHandler, StateHandler } from './state';
import { Request, Response } from './types';

export type ComposeMiddleware = (
  req: Request,
  res: Response,
  option: ComposeOpition
) => Promise<Response>;

type Compose = (
  req: Request,
  res: Response,
  option: ComposeOpition,
  stateHandler: StateHandler
) => Promise<Response>;

type ComposeOpition = {
  scripts: MiddlewareArgType[];
  matcher?: (req: Request) => boolean | Promise<boolean>;
  next?: ComposeOpition;
};

export const compose: Compose = async (req, res, option, handler) => {
  const { scripts, matcher, next } = option;

  if (matcher && !matcher(req)) {
    return res;
  }

  const result = await pipe(req, res, scripts, handler);
  const { brokenAll } = handler.getState();

  if (brokenAll) {
    return result;
  }

  handler.dispatch('reset');
  return next ? compose(req, result, next, handler) : result;
};

export const composeMiddleware: ComposeMiddleware = (req, res, option) => {
  return compose(req, res, option, stateHandler);
};
