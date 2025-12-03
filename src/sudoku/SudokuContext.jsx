import { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { generateGame, findConflicts, inRange, isFull, findFirst } from "./logic";

const SudokuCtx = createContext(null);

const initialState = {
  mode: "normal",
  size: 9,
  blockRows: 3,
  blockCols: 3,

  init_board: [],
  final_board: [],
  curr_board: [],
  bool_init: [],

  conflicts: new Set(),
  status: "playing",      // playing | won
  startedAt: null,
  elapsedMs: 0,
  locked: false,
  hint: null,
};

function makeBoolean(init_board) {
  return init_board.map((row) => row.map((v) => v != null));
}

function cloneBoard(g) {
  return g.map((r) => r.slice());
}

function reducer(state, action) {
  switch (action.type) {
    case "NEW_GAME": {
      let mode = action.mode ?? state.mode;

      const game = generateGame(mode);
      const size = game.size;
      const blockRows = game.blockRows;
      const blockCols = game.blockCols;
      const init_board = game.init_board;
      const final_board = game.final_board;

      const curr_board = init_board.map((r) => r.slice());
      const bool_init = makeBoolean(init_board);
      const conflicts = findConflicts(curr_board, size, blockRows, blockCols);

      return {
        ...state,
        mode,
        size,
        blockRows,
        blockCols,
        init_board,
        final_board,
        curr_board,
        bool_init,
        conflicts,
        status: "playing",
        locked: false,
        startedAt: Date.now(),
        elapsedMs: 0,
        hint: null,
      };
    }

    case "INIT_FROM_BACKEND": {
      const {
        mode,
        size,
        blockRows,
        blockCols,
        init_board,
        final_board,
        isCompleted,
      } = action.game;

      const curr_board = (isCompleted ? final_board : init_board).map((r) =>
        r.slice()
      );
      const bool_init = makeBoolean(init_board);
      const allConflicts = findConflicts(
        curr_board,
        size,
        blockRows,
        blockCols
      );

      const displayConflicts = new Set(
        Array.from(allConflicts).filter((key) => {
          const [rr, cc] = key.split("-").map(Number);
          return !bool_init[rr][cc] && curr_board[rr][cc] != null;
        })
      );

      return {
        ...state,
        mode,
        size,
        blockRows,
        blockCols,
        init_board,
        final_board,
        curr_board,
        bool_init,
        conflicts: displayConflicts,
        status: isCompleted ? "won" : "playing",
        locked: !!isCompleted,
        startedAt: isCompleted ? null : Date.now(),
        elapsedMs: 0,
        hint: null,
      };
    }

    case "RESET": {
      const curr_board = state.init_board.map(function (r) { return r.slice(); });
      const conflicts = findConflicts(
        curr_board,
        state.size,
        state.blockRows,
        state.blockCols
      );
      return {
        ...state,
        curr_board: curr_board,
        conflicts: conflicts,
        status: "playing",
        locked: false,
        startedAt: Date.now(),
        elapsedMs: 0,
        hint: null,
      };
    }

    case "FIND_HINT": {
      if (state.locked) return { ...state, hint: null };
      const hit = findFirst(
        state.curr_board,
        state.size,
        state.blockRows,
        state.blockCols
      );
      return { ...state, hint: hit };
    }

    case "CLEAR_HINT": {
      return { ...state, hint: null };
    }

    case "TICK": {
      if (state.status !== "playing") return state;
      const startTime = state.startedAt ?? Date.now();
      return {
        ...state,
        elapsedMs: Date.now() - startTime,
      };
    }

    case "UPDATE_CELL": {
      if (state.locked) return state;

      const { r, c, value } = action;

      if (state.bool_init[r][c]) return state;

      const v = inRange(value, state.size) ? value : null;

      const curr_board = cloneBoard(state.curr_board);
      curr_board[r][c] = v;

      const allConflicts = findConflicts(
        curr_board,
        state.size,
        state.blockRows,
        state.blockCols
      );

      const displayConflicts = new Set(
        Array.from(allConflicts).filter((key) => {
          const [rr, cc] = key.split("-").map(Number);
          return !state.bool_init[rr][cc] && curr_board[rr][cc] != null;
        })
      );

      let status = state.status;
      let locked = state.locked;
      let hint = state.hint;

      if (hint && hint.r === r && hint.c === c) {
        hint = null;
      }

      if (isFull(curr_board) && allConflicts.size === 0) {
        status = "won";
        locked = true;
        hint = null;
      }

      return {
        ...state,
        curr_board,
        conflicts: displayConflicts,
        status,
        locked,
        hint,
      };
    }

    default:
      return state;
  }
}

export function SudokuProvider(props) {
  const { children, initialMode = "normal", initialGame = null } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (initialGame) {
      dispatch({ type: "INIT_FROM_BACKEND", game: initialGame });
    } else {
      dispatch({ type: "NEW_GAME", mode: initialMode });
    }
  }, [initialMode, initialGame]);

  // timer
  useEffect(() => {
    const t = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 500);
    return () => clearInterval(t);
  }, []);

  const value = useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  return (
    <SudokuCtx.Provider value={value}>
      {children}
    </SudokuCtx.Provider>
  );
}

export function useSudoku() {
  const ctx = useContext(SudokuCtx);
  if (!ctx) {
    throw new Error("useSudoku must be used within SudokuProvider");
  }
  return ctx;
}