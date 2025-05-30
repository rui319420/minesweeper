'use client';

import { useState } from 'react';
import styles from './page.module.css';

const userInput: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0) as number[]);
// 0:何もしない 1:旗 2:はてな 3:開く

const bombMap: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
]; //0:何もない 1:爆弾がある

const calcMap = (userInput: number[][], bombMap: number[][]) => {
  const board: number[][] = [];
  for (let y = 0; y < userInput.length; y++) {
    const row: number[] = [];
    for (let x = 0; x < userInput[y].length; x++) {
      const cellValue = userInput[y][x];
      if (cellValue === 3) {
        row.push(3);
      } else if (cellValue === 1) {
        row.push(1);
      } else if (cellValue === 2) {
        row.push(2);
      } else {
        row.push(0);
      }
    }
    board.push(row);
  }
  return board;
};

export default function Home() {
  const [userInputBoard, setUserInputBoard] = useState(userInput);
  // 実際に表示する盤面を管理するステート (calcDisplayMapの結果)
  // userInput と bombMap はファイル冒頭で定義されている定数
  const initialDisplayBoard = calcMap(userInput, bombMap);
  const [displayBoard, setDisplayBoard] = useState<number[][]>(initialDisplayBoard); // ここを修正
  // ランダムなbombMapを状態として管理
  const [currentBombMap, setCurrentBombMap] = useState<number[][]>([]);

  // // コンポーネントがマウントされたとき、またはゲームがリセットされたときにbombMapを生成
  // useEffect(() => {
  //   // 最初のレンダリング時のみbombMapを生成するようにする
  //   if (currentBombMap.length === 0) {
  //     // bombMapがまだ生成されていなければ
  //     setCurrentBombMap(generateRandomBombMap(ROWS, COLS, NUM_BOMBS));
  //   }
  // }, []); // 空の依存配列なので、初回レンダリング時に一度だけ実行

  const handleCellClick = (x: number, y: number) => {
    if (userInput[x][y] === 3 || userInput[x][y] === 1 || userInput[x][y] === 2) {
      return;
    }
    const newUserInputBoard = structuredClone(userInputBoard);
    newUserInputBoard[x][y] = 3; // セルを「開かれた」状態にする
    setUserInputBoard(newUserInputBoard);

    const newDisplayBoard = calcMap(newUserInputBoard, currentBombMap); // currentBombMapも使うように変更
    setDisplayBoard(newDisplayBoard);
  };
  // 右クリック（旗・はてなを切り替える）
  const handleCellRightClick = (event: React.MouseEvent, x: number, y: number) => {
    event.preventDefault(); // デフォルトのコンテキストメニューをキャンセル

    // 既に開かれているセルには反応しない
    // 修正: userInputBoard[x][y] と displayBoard[x][y] を参照する
    if (userInputBoard[x][y] === 3 || (displayBoard[x][y] >= 4 && displayBoard[x][y] <= 12)) {
      return;
    }

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
                    cellValue === 3 || (cellValue >= 4 && cellValue <= 12) ? styles.openedEmpty : ''
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
