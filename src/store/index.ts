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

export type Store = {
  getState: () => State;
  dispatch: (action: Action) => Action;
};

export const createStore = () => {
  let state = initialState;
  return {
    getState: () => state,
    dispatch: (action: Action) => {
      state = reducer(state, action);
      return action;
    },
  };
};
