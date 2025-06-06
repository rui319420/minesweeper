'use client';

import { useState } from 'react';
import styles from './page.module.css';

const ROWS = 9; //行のこと
const COLS = 9; //列のこと
const NUM_BOMBS = 10; //爆弾の数
let first = 1;

const userInput: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0) as number[]);
// 0:何もしない 1:旗 2:はてな 3:開く

const generateRandomBombMap = (
  rows: number,
  cols: number,
  numBombs: number,
  firstClickY: number,
  firstClickX: number,
): number[][] => {
  const newBombMap: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  let placedBombs = 0;

  while (placedBombs < numBombs) {
    const ramY = Math.floor(Math.random() * rows); // 行 (y)
    const ramX = Math.floor(Math.random() * cols); // 列 (x)

    if (newBombMap[ramY][ramX] === 0 && (ramY !== firstClickY || ramX !== firstClickX)) {
      newBombMap[ramY][ramX] = 1; // 爆弾を配置
      placedBombs++;
    }
  }
  return newBombMap;
};
//0:何もない 1:爆弾がある

const countAroundBombs = (bombMap: number[][], y: number, x: number) => {
  let bombCount = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      const newY = y + i;
      const newX = x + j;
      if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
        if (bombMap[newY][newX] === 1) {
          bombCount++;
        }
      }
    }
  }
  return bombCount;
};

const calcMap = (userInput: number[][], bombMap: number[][]) => {
  const board: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: number[] = [];
    for (let x = 0; x < COLS; x++) {
      const userAction = userInput[y][x];

      if (userAction === 1) {
        // 旗
        row.push(1);
      } else if (userAction === 2) {
        // はてな
        row.push(2);
      } else if (userAction === 3) {
        // 開く
        if (bombMap[y][x] === 1) {
          row.push(99); // 爆弾
        } else {
          const bombCount = countAroundBombs(bombMap, y, x);
          if (bombCount !== 0) {
            row.push(10 + bombCount); //一の位で分かりやすいように10を足して調整
          } else {
            row.push(3); // 開いた空のマス
          }
        }
      } else {
        // 未開封
        row.push(0);
      }
    }
    board.push(row);
  }
  return board;
};
const directions = [[-1, -1], [0, -1], [1 - 1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
//連続して開ける処理を行う関数
const openChain = (y: number, x: number, board: number[][], bombMap: number[][]) => {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS || board[y][x] === 3) {
    return; //盤面の外に出たら終了
  }
  if (countAroundBombs(bombMap, y, x) > 0) {
    board[y][x] = 3;
    return;
  }
  board[y][x] = 3;
  for (const [dy, dx] of directions) {
    openChain(y + dy, x + dx, board, bombMap);
  }
};

export default function Home() {
  const [userInputBoard, setUserInputBoard] = useState(userInput);
  const [bombMap, setBombMap] = useState<number[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  for (const ooo of bombMap) {
    for (const iii of ooo) {
      let j = 0;
      if (iii === 0) {
        j++;
        console.log(j);
      }
    }
  }
  const displayBoard = calcMap(userInputBoard, bombMap);
  const handleCellClick = (y: number, x: number) => {
    if (bombMap[y][x] === 0 && first === 1) {
      const newG = generateRandomBombMap(ROWS, COLS, NUM_BOMBS, y, x);
      setBombMap(newG);
      first = 2;
    }
    if (userInputBoard[y][x] === 3 || userInputBoard[y][x] === 1 || userInputBoard[y][x] === 2) {
      return;
    }

    const newUserInputBoard = structuredClone(userInputBoard);
    openChain(y, x, newUserInputBoard, bombMap);
    setUserInputBoard(newUserInputBoard);
  };

  // 右クリック（旗・はてなを切り替える）
  const handleCellRightClick = (event: React.MouseEvent, y: number, x: number) => {
    event.preventDefault();

    const newUserInputBoard = structuredClone(userInputBoard);
    const currentColor = newUserInputBoard[y][x];

    // 0:未開封 -> 1:旗 -> 2:はてな -> 0:未開封
    if (currentColor === 0) {
      newUserInputBoard[y][x] = 1;
    } else if (currentColor === 1) {
      newUserInputBoard[y][x] = 2;
    } else if (currentColor === 2) {
      newUserInputBoard[y][x] = 0;
    }
    setUserInputBoard(newUserInputBoard);
  };
  //マスの見た目を決める関数
  const getBackgroundPosition = (cellValue: number) => {
    switch (cellValue) {
      case 0: // 未開封
        return '0px -30px';
      case 1: // 旗
        return '-270px 0px';
      case 2: // はてな
        return '-240px 0px';
      case 3: // 開いたセル
        return '';
      case 11: // 1
        return '-0px 0px';
      case 12: // 2
        return '-30px 0px';
      case 13: // 3
        return '-60px 0px';
      case 14: // 4
        return '-90px 0px';
      case 15: // 5
        return '-120px 0px';
      case 16: // 6
        return '-150px 0px';
      case 17: // 7
        return '-180px 0px';
      case 18: // 8
        return '-210px 0px';
      case 99: // 爆弾のマス
        return '-300px 0px';
      default:
        return '0px 0px'; // デフォルト
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {/* displayBoardをレンダリングする */}
        {displayBoard.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cellValue, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${
                  cellValue === 3 || cellValue >= 10 ? styles.openedEmpty : ''
                }`}
                style={
                  getBackgroundPosition(cellValue)
                    ? { backgroundPosition: getBackgroundPosition(cellValue) }
                    : { backgroundPosition: 'none' } // backgroundPositionを'none'に設定
                }
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)} // 右クリックイベントを追加
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
