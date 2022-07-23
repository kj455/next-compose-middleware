type State = {
  brokenOnce: boolean;
  brokenAll: boolean;
};

const initialState: State = {
  brokenOnce: false,
  brokenAll: false,
};

let currentState = initialState;

type Action = 'breakOnce' | 'breakAll' | 'reset';

export const reducer = (state = initialState, action: Action) => {
  switch (action) {
    case 'breakOnce':
      return {
        ...state,
        brokenOnce: true,
      };
    case 'breakAll':
      return {
        ...state,
        brokenAll: true,
      };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

const dispatch = (action: Action) => {
  currentState = reducer(currentState, action);
  return action;
};

export type StateHandler = {
  getState: () => State;
  dispatch: (action: Action) => Action;
};

export const stateHandler = {
  getState: () => currentState,
  dispatch,
};
