import { pipe, PipeableMiddleware } from './pipe';
import { stateHandler, StateHandler } from './state';
import { Request, Response } from './types';

export type NestMiddleware = (
  req: Request,
  res: Response,
  option: NestOpition
) => Promise<Response>;

type Nest = (
  req: Request,
  res: Response,
  option: NestOpition,
  stateHandler: StateHandler
) => Promise<Response>;

type NestOpition = {
  scripts: PipeableMiddleware[];
  matcher?: (req: Request) => boolean | Promise<boolean>;
  next?: NestOpition;
};

export const nest: Nest = async (req, res, option, handler) => {
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
  return next ? nest(req, result, next, handler) : result;
};

export const nestMiddleware: NestMiddleware = (req, res, option) => {
  return nest(req, res, option, stateHandler);
};