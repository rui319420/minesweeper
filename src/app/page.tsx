'use client';

import { useState } from 'react';
import styles from './page.module.css';

const ROWS = 9;
const COLS = 9;
const NUM_BOMBS = 10;

const userInput: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0) as number[]);
// 0:何もしない 1:旗 2:はてな 3:開く

const generateRandomBombMap = (rows: number, cols: number, numBombs: number): number[][] => {
  const newBombMap: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  let placedBombs = 0;

  while (placedBombs < numBombs) {
    const y = Math.floor(Math.random() * rows); // 行 (y)
    const x = Math.floor(Math.random() * cols); // 列 (x)

    if (newBombMap[y][x] === 0) {
      // そのマスにまだ爆弾がなければ
      newBombMap[y][x] = 1; // 爆弾を配置
      placedBombs++;
    }
  }
  return newBombMap; // 生成した爆弾マップを返す
};
//0:何もない 1:爆弾がある

const puttingBomb = (bombMap: number[][]) => {
  const bombCount = 10; // 爆弾の数
  let placedBombs = 0;

  while (placedBombs < bombCount) {
    const x = Math.floor(Math.random() * 9);
    const y = Math.floor(Math.random() * 9);

    if (bombMap[y][x] === 0) {
      bombMap[y][x] = 1; // 爆弾を配置
      placedBombs++;
    }
  }
};

const calcMap = (userInput: number[][], bombMap: number[][]) => {
  const board: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: number[] = [];
    for (let x = 0; x < COLS; x++) {
      const userAction = userInput[y][x];

      if (userAction === 1) {
        // 旗が置かれている場合
        row.push(1); // 表示上も旗
      } else if (userAction === 2) {
        // はてなが置かれている場合
        row.push(2); // 表示上もはてな
      } else if (userAction === 3) {
        // マスが開かれている場合
        if (bombMap[y][x] === 1) {
          row.push(99); // 爆弾がある場合は99 (表示用に特別な値)
        } else {
          row.push(3); // 開かれた空のマス (数字はまだ表示しない)
        }
      } else {
        // 未開封の場合 (userAction === 0)
        row.push(0); // 未開封として表示
      }
    }
    board.push(row);
  }
  return board;
};

export default function Home() {
  const [userInputBoard, setUserInputBoard] = useState(userInput);
  const [bombMap] = useState<number[][]>(() => generateRandomBombMap(ROWS, COLS, NUM_BOMBS));

  const displayBoard = calcMap(userInputBoard, bombMap);
  const handleCellClick = (x: number, y: number) => {
    if (userInputBoard[x][y] === 3 || userInputBoard[x][y] === 1 || userInputBoard[x][y] === 2) {
      return;
    }

    const newUserInputBoard = structuredClone(userInputBoard);
    newUserInputBoard[x][y] = 3;
    setUserInputBoard(newUserInputBoard);
  };
  // 右クリック（旗・はてなを切り替える）
  const handleCellRightClick = (event: React.MouseEvent, x: number, y: number) => {
    event.preventDefault();

    // 修正: userInput を参照するのではなく、userInputBoard ステートを複製して操作する
    const newUserInputBoard = structuredClone(userInputBoard);
    const currentColor = newUserInputBoard[x][y]; // 現在のセルの状態を取得

    // 0:未開封 -> 1:旗 -> 2:はてな -> 0:未開封
    if (currentColor === 0) {
      newUserInputBoard[x][y] = 1; // 未開封から旗へ
    } else if (currentColor === 1) {
      newUserInputBoard[x][y] = 2; // 旗からはてなへ
    } else if (currentColor === 2) {
      newUserInputBoard[x][y] = 0; // はてなから未開封へ
    }
    setUserInputBoard(newUserInputBoard); // userInputBoardを更新
  };
  //マスの見た目を決める関数
  const getBackgroundPosition = (cellValue: number) => {
    switch (cellValue) {
      case 0: // 未開封
        return '-30px -30px';
      case 1: // 旗
        return '-270px 0px';
      case 2: // はてな
        return '-240px 0px';
      case 3: // 開いたセル
        return '';
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
            {row.map(
              (
                cellValue,
                colIndex, // cellValueを使う
              ) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  // openedEmpty クラスの適用条件を見直し
                  // cellValue が 3 (開かれた空のマス) または 4-12 (数字/爆弾マス) の場合に適用
                  className={`${styles.cell} ${
                    cellValue === 3 || cellValue === 99 // ここに || cellValue === 99 を追加
                      ? styles.openedEmpty
                      : ''
                  }`}
                  style={
                    // getBackgroundPositionが空文字列を返したらbackgroundPositionを'none'に設定
                    getBackgroundPosition(cellValue)
                      ? { backgroundPosition: getBackgroundPosition(cellValue) }
                      : { backgroundPosition: 'none' } // backgroundPositionを'none'に設定
                  }
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)} // 右クリックイベントを追加
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
