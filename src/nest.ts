import { PipeableMiddleware } from './pipe';
import { Request, Response } from './types';

type NestOpition = {
  scripts: PipeableMiddleware[];
  matcher?: (path: string) => boolean | Promise<boolean>;
  nest?: NestOpition;
};

type NestMiddleware = (
  req: Request,
  res: Response,
  option: NestOpition
) => Promise<Response>;

export const nestMiddleware: NestMiddleware = async (req, res, option) => {
  const { scripts, matcher, nest } = option;
  const { nextUrl } = req;
  if (matcher && !matcher(nextUrl.pathname)) {
    return res;
  }

  let lastRes = res;
  for (const script of scripts) {
    const result = await script(req, lastRes);
    if (!result) {
      return res;
    }
    lastRes = result;
  }

  if (nest) {
    return nestMiddleware(req, lastRes, nest);
  }

  return lastRes;
};
