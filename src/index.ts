export type NextPipeMiddleware = () => {};

export const pipeMiddleware = () => {
  console.log('pipeMiddleware');
};
