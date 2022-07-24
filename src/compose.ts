import { pipe } from './pipe';
import { stateHandler, StateHandler } from './state';
import { Request, Response } from './types';

type ComposeMiddleware = (
  req: Request,
  res: Response,
  option: ComposeOption
) => Promise<Response>;

type ComposeOption = {
  scripts: Middleware[];
  [path: Path]: Middleware[] | ComposeOption;
};

export type Middleware = ComposableMiddleware | [ComposableMiddleware, Option];

export type ComposableMiddleware = (
  req: Request,
  res: Response,
  handler?: {
    breakOnce: (res: Response) => Response;
    breakAll: (res: Response) => Response;
  }
) => Promise<Response>;
type Option = {
  matcher?: (req: Request) => boolean | Promise<boolean>;
};

type Compose = (
  req: Request,
  res: Response,
  option: ComposeOption,
  stateHandler: StateHandler
) => Promise<Response>;

type Path = `/${string}`;

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

  const isComposeOption = !('length' in nextValue);
  if (isComposeOption) {
    dispatch({ type: 'setPath', payload: restPath });
    return composeMain(req, result, nextValue, handler);
  }

  return pipe(req, result, nextValue, handler);
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
