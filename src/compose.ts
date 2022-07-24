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

type Path = `/${string}`;
type ComposeOpition = {
  scripts: MiddlewareArgType[];
  [path: Path]: MiddlewareArgType | ComposeOpition;
};

export const getPathList = (path: string): string[] => {
  const exceptHeadEmpty = path.split('/').slice(1);
  const exceptTailEmpty =
    exceptHeadEmpty.at(-1) === ''
      ? exceptHeadEmpty.slice(0, -1)
      : exceptHeadEmpty;
  return exceptTailEmpty;
};

export const toPath = (path: string): Path => {
  return path.startsWith('/') ? (path as Path) : `/${path}`;
};

export const composeMain: Compose = async (req, res, option, handler) => {
  const { getState, dispatch } = handler;
  const { scripts, ...paths } = option;

  const result = await pipe(req, res, scripts, handler);

  const { path, brokenAll } = getState();
  if (brokenAll) {
    return result;
  }

  const [next, ...restPath] = path;
  if (next === undefined) {
    return result;
  }

  const nextValue = paths[toPath(next)];
  if (nextValue === undefined) {
    return result;
  }

  const isOption = typeof nextValue !== 'function' && !('length' in nextValue);
  if (isOption) {
    dispatch({ type: 'setPath', payload: restPath });
    return composeMain(req, result, nextValue, handler);
  }

  return pipe(req, result, [nextValue], handler);
};

export const compose: Compose = async (req, res, option, handler) => {
  handler.dispatch({
    type: 'setPath',
    payload: getPathList(req.nextUrl.pathname),
  });
  return composeMain(req, res, option, handler);
};

export const composeMiddleware: ComposeMiddleware = (req, res, option) => {
  return compose(req, res, option, stateHandler);
};
