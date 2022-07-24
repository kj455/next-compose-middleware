import { ComposableMiddleware, ComposeOption } from './compose';

export type Path = `/${string}`;

export const getDividedPaths = (path: string): string[] => {
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

export const isDynamicPath = (path: string): boolean => {
  const dynamicPathregex = /^\/\[\w+\]$/;
  return dynamicPathregex.test(path);
};

export const findPathValue = (
  pathMap: Omit<ComposeOption, 'scripts'>,
  path: Path
): ComposableMiddleware[] | ComposeOption | null => {
  const value = pathMap[path];
  if (value) {
    return value;
  }

  const found = Object.keys(pathMap).find((key) => isDynamicPath(key));
  const dynamicPath = found ? toPath(found) : null;

  if (dynamicPath === null) {
    return null;
  }
  return pathMap[dynamicPath] ?? null;
};
