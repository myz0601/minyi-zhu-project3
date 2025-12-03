/**
 * return a shuffled copy of an array
 */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
}

/**
 * random swap 50% chance
 */
function doSwap() {
  return Math.random() < 0.5;
}

/**
 * swap two positions in an array in-place
 */
function swap(arr, i, j) {
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}

/**
 * deep copy a 2D grid of numbers
 */
function deepCopy(g) {
  return g.map(function (r) {
    return r.slice();
  });
}

/**
 * for a given board size, return block dimensions
 */
function getBlockDims(size) {
  if (size === 6) return { blockRows: 2, blockCols: 3 };
  // Default 9x9
  return { blockRows: 3, blockCols: 3 };
}

/**
 * build a valid full board
 */
function fillBoard(size) {
  const dims = getBlockDims(size);
  const blockRows = dims.blockRows;
  const blockCols = dims.blockCols;

  const board = Array.from({ length: size }, function () {
    return Array(size).fill(0);
  });

  for (let r = 0; r < size; r++) {
    const groupIdx = Math.floor(r / blockRows); // which block row the row is in
    const rowInGroup = r % blockRows; // index inside that group

    const shift = (rowInGroup * blockCols + groupIdx) % size;
    for (let c = 0; c < size; c++) {
      board[r][c] = ((c + shift) % size) + 1;
    }
  }
  return board;
}

/**
 * randomly swap rows inside each block row group
 */
function swapRowsWithinGroup(board) {
  const N = board.length;
  const dims = getBlockDims(N);
  const blockRows = dims.blockRows;
  const numGroup = Math.floor(N / blockRows);

  for (let g = 0; g < numGroup; g++) {
    const s = g * blockRows; // start row of this group
    for (let i = 0; i < blockRows - 1; i++) {
      for (let j = i + 1; j < blockRows; j++) {
        if (doSwap()) {
          swap(board, s + i, s + j);
        }
      }
    }
  }
}

/**
 * randomly swap columns inside each block column group
 */
function swapColsWithinGroup(board) {
  const N = board.length;
  const dims = getBlockDims(N);
  const blockCols = dims.blockCols;
  const numGroup = Math.floor(N / blockCols);

  for (let g = 0; g < numGroup; g++) {
    const s = g * blockCols; // start col of this group
    for (let i = 0; i < blockCols - 1; i++) {
      for (let j = i + 1; j < blockCols; j++) {
        if (!doSwap()) continue;
        const c1 = s + i;
        const c2 = s + j;
        if (c1 >= N || c2 >= N) continue;
        // swap whole columns c1, c2
        for (let r = 0; r < N; r++) {
          const row = board[r];
          const t = row[c1];
          row[c1] = row[c2];
          row[c2] = t;
        }
      }
    }
  }
}

/**
 * randomly swap entire row groups
 */
function swapRowGroups(board) {
  const N = board.length;
  const dims = getBlockDims(N);
  const blockRows = dims.blockRows;
  const numGroup = Math.floor(N / blockRows);

  for (let a = 0; a < numGroup; a++) {
    for (let b = a + 1; b < numGroup; b++) {
      if (!doSwap()) continue;
      const sa = a * blockRows;
      const sb = b * blockRows;
      for (let k = 0; k < blockRows; k++) {
        swap(board, sa + k, sb + k);
      }
    }
  }
}

/**
 * randomly swap entire column groups
 */
function swapColGroups(board) {
  const N = board.length;
  const dims = getBlockDims(N);
  const blockCols = dims.blockCols;
  const numGroup = Math.floor(N / blockCols);

  for (let a = 0; a < numGroup; a++) {
    for (let b = a + 1; b < numGroup; b++) {
      if (!doSwap()) continue;
      const sa = a * blockCols;
      const sb = b * blockCols;
      for (let k = 0; k < blockCols; k++) {
        const c1 = sa + k;
        const c2 = sb + k;
        // swap whole columns c1, c2
        for (let r = 0; r < N; r++) {
          const row = board[r];
          const t = row[c1];
          row[c1] = row[c2];
          row[c2] = t;
        }
      }
    }
  }
}

/**
 * randomly swap pairs of number labels (1 <-> 9, 2 <-> 8, ...)
 */
function swapNums(board) {
  const N = board.length;
  for (let i = 1; i <= Math.floor(N / 2); i++) {
    const j = N + 1 - i;
    if (!doSwap()) continue;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (board[r][c] === i) board[r][c] = j;
        else if (board[r][c] === j) board[r][c] = i;
      }
    }
  }
}

/**
 * check if placing value v at (r,c) is safe
 */
function isSafe(board, r, c, v, br, bc) {
  const N = board.length;
  // row and column
  for (let k = 0; k < N; k++) {
    if (board[r][k] === v) return false;
    if (board[k][c] === v) return false;
  }
  // subgrid
  const r0 = Math.floor(r / br) * br;
  const c0 = Math.floor(c / bc) * bc;
  for (let i = 0; i < br; i++) {
    for (let j = 0; j < bc; j++) {
      if (board[r0 + i][c0 + j] === v) return false;
    }
  }
  return true;
}

/**
 * find first empty cell
 */
function findEmpty(board) {
  const N = board.length;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] == null) return [r, c];
    }
  }
  return null;
}

/**
 * count the number of solutions for current board
 * solution = 1 is what we need
 */
function countSolutions(board, br, bc, limit = 2) {
  let solutions = 0;

  function dfs() {
    if (solutions >= limit) return;

    const pos = findEmpty(board);
    // no empty cell => one complete valid solution
    if (!pos) {
      solutions += 1;
      return;
    }

    const r = pos[0];
    const c = pos[1];
    const N = board.length;

    // try each value
    for (let v = 1; v <= N; v++) {
      if (!isSafe(board, r, c, v, br, bc)) continue;

      board[r][c] = v;
      dfs();
      board[r][c] = null;

      if (solutions >= limit) return;
    }
  }

  dfs();
  return solutions;
}

/**
 * remove numbers from a grid that has a unique solution
 * only keep cells if the resulting puzzle still has a unique solution
 */
function removeNums(board, numsLeft, br, bc) {
  const N = board.length;
  const total = N * N;

  const cells = shuffle(
    Array.from({ length: total }, function (_, k) {
      return [ (k / N) | 0, k % N ];
    })
  );

  let kept = total;
  for (const pair of cells) {
    const r = pair[0];
    const c = pair[1];

    if (kept <= numsLeft) break;
    const bak = board[r][c];
    if (bak == null) continue;

    // try removing this cell
    board[r][c] = null;

    // check how many solutions the puzzle has
    const tmp = deepCopy(board);
    const solCount = countSolutions(tmp, br, bc, 2);

    if (solCount !== 1) {
      // not unique, revert removal
      board[r][c] = bak;
    } else {
      kept--;
    }
  }
}

/**
 * generate a Sudoku game for a given mode
 */
export function generateGame(mode) {
  let size;
  let blockRows;
  let blockCols;
  let keep;

  if (mode === "easy") {
    size = 6;
    const dimsEasy = getBlockDims(6);
    blockRows = dimsEasy.blockRows;
    blockCols = dimsEasy.blockCols;
    keep = 18;
  } else {
    size = 9;
    const dimsNormal = getBlockDims(9);
    blockRows = dimsNormal.blockRows;
    blockCols = dimsNormal.blockCols;
    // 28–30 for 9x9
    keep = 28 + ((Math.random() * 3) | 0);
  }

  const board = fillBoard(size);

  swapRowsWithinGroup(board);
  swapColsWithinGroup(board);
  swapRowGroups(board);
  swapColGroups(board);
  swapNums(board);

  const final_board = deepCopy(board);

  removeNums(board, keep, blockRows, blockCols);
  const init_board = board;

  return { size, blockRows, blockCols, init_board, final_board };
}

/**
 * check if v is an integer in [1, size]
 */
export function inRange(v, size) {
  return Number.isInteger(v) && v >= 1 && v <= size;
}

/**
 * check if the board is full
 */
export function isFull(grid) {
  for (const row of grid) {
    for (const v of row) {
      if (v == null) return false;
    }
  }
  return true;
}

/**
 * find conflicts in rows, columns and subgrids
 */
export function findConflicts(grid, size, br, bc) {
  // set to store 'r-c' string conflicts
  const conflicts = new Set();

  // rows
  for (let r = 0; r < size; r++) {
    const seen = new Map();
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v == null) continue;
      const key = "r" + r + "-" + v;
      if (seen.has(key)) {
        conflicts.add(r + "-" + c);
        conflicts.add(r + "-" + seen.get(key));
      } else {
        seen.set(key, c);
      }
    }
  }

  // columns
  for (let c = 0; c < size; c++) {
    const seen = new Map();
    for (let r = 0; r < size; r++) {
      const v = grid[r][c];
      if (v == null) continue;
      const key = "c" + c + "-" + v;
      if (seen.has(key)) {
        conflicts.add(r + "-" + c);
        conflicts.add(seen.get(key) + "-" + c);
      } else {
        seen.set(key, r);
      }
    }
  }

  // subgrids
  for (let bri = 0; bri < size; bri += br) {
    for (let bci = 0; bci < size; bci += bc) {
      const seen = new Map();
      for (let i = 0; i < br; i++) {
        for (let j = 0; j < bc; j++) {
          const rr = bri + i;
          const cc = bci + j;
          const v = grid[rr][cc];
          if (v == null) continue;
          const key = "b" + bri + "-" + bci + "-" + v;
          if (seen.has(key)) {
            conflicts.add(rr + "-" + cc);
            conflicts.add(seen.get(key));
          } else {
            seen.set(key, rr + "-" + cc);
          }
        }
      }
    }
  }
  return conflicts;
}


/*
* Added for Hint System.
*/


/**
 * return all valid candidates at (r,c) given current grid
 */
export function validNumsInCell(grid, size, br, bc, r, c) {
  if (grid[r][c] != null) return [];
  const allNums = [];
  for (let v = 1; v <= size; v++) {
    if (isSafe(grid, r, c, v, br, bc)) {
      allNums.push(v);
    }
  }
  return allNums;
}

/**
 * find the first cell that has exactly one valid candidate
 */
export function findFirst(grid, size, br, bc) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] != null) continue;
      const cand = validNumsInCell(grid, size, br, bc, r, c);
      if (cand.length === 1) {
        return { r: r, c: c };
      }
    }
  }
  return null;
}
