type State = {
  path: string[];
  brokenOnce: boolean;
  brokenAll: boolean;
};

const initialState: State = {
  path: [],
  brokenOnce: false,
  brokenAll: false,
};

let currentState = initialState;

type Action =
  | {
      type: 'setPath';
      payload: string[];
    }
  | {
      type: 'breakOnce';
    }
  | {
      type: 'breakAll';
    }
  | {
      type: 'reset';
    };
// type Action = 'setPath' | 'breakOnce' | 'breakAll' | 'reset';

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'setPath':
      return {
        ...state,
        path: action.payload,
      };
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
