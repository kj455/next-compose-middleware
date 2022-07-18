import { NextRequest, NextResponse } from 'next/server';

export type Request = NextRequest;
export type Response = NextResponse;

export type FinalResponse = {
  res: Response;
  final: true;
};
export type PipeableMiddleware = (
  req: Request,
  res: Response
) => Promise<Response | FinalResponse>;

type Option = {
  matcher?: (path: string) => boolean | Promise<boolean>;
};

type PipeMiddleware = (
  req: Request,
  res: Response,
  middlewares: (PipeableMiddleware | [PipeableMiddleware, Option])[]
) => Promise<Response>;

export const pipeMiddleware: PipeMiddleware = async (req, res, middlewares) => {
  if (middlewares.length === 0) {
    return res;
  }
  const [next, ...rest] = middlewares;
  const [middleware, nextMiddlewareOption] =
    typeof next === 'function' ? [next, null] : [next[0], next[1]];

  if (nextMiddlewareOption?.matcher?.(req.nextUrl.pathname)) {
    return pipeMiddleware(req, res, rest);
  }

  const result = await middleware(req, res);
  if ('final' in result) {
    return result.final ? result.res : pipeMiddleware(req, res, rest);
  }

  return pipeMiddleware(req, result, rest);
};
