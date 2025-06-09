'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

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

const countAroundBombs = (
  bombMap: number[][],
  y: number,
  x: number,
  rows: number,
  cols: number,
) => {
  let bombCount = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      const newY = y + i;
      const newX = x + j;
      if (newY >= 0 && newY < rows && newX >= 0 && newX < cols) {
        if (bombMap[newY][newX] === 1) {
          bombCount++;
        }
      }
    }
  }
  return bombCount;
};

const calcMap = (
  userInput: number[][],
  bombMap: number[][],
  rows: number,
  cols: number,
): number[][] => {
  const board: number[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: number[] = [];
    for (let x = 0; x < cols; x++) {
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
          const bombCount = countAroundBombs(bombMap, y, x, rows, cols);
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
const directions = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];
// 連続して開ける処理を行う関数
const openChain = (
  y: number,
  x: number,
  board: number[][],
  bombMap: number[][],
  rows: number,
  cols: number,
) => {
  if (y < 0 || y >= rows || x < 0 || x >= cols || board[y][x] === 3 || bombMap[y][x] === 1) {
    return;
  }
  if (countAroundBombs(bombMap, y, x, rows, cols) > 0) {
    board[y][x] = 3;
    return;
  }
  board[y][x] = 3;
  for (const [dy, dx] of directions) {
    openChain(y + dy, x + dx, board, bombMap, rows, cols);
  }
};

export default function Home() {
  const [userInputBoard, setUserInputBoard] = useState(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0) as number[]),
  );
  const [bombMap, setBombMap] = useState<number[][] | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'clear'>('playing');
  const [time, setTime] = useState(0);
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [numBombs, setNumBombs] = useState(10);
  const [remainingBombs, setRemainingBombs] = useState(numBombs);
  const displayBoard = calcMap(userInputBoard, bombMap ?? [], rows, cols);

  const DIFFICULTY_LEVELS = {
    beginner: { rows: 9, cols: 9, bombs: 10 },
    intermediate: { rows: 16, cols: 16, bombs: 40 },
    expert: { rows: 16, cols: 30, bombs: 99 },
  };

  const handleDifficultyChange = (level: keyof typeof DIFFICULTY_LEVELS) => {
    const newSettings = DIFFICULTY_LEVELS[level];

    // 1. 新しい設定をstateにセット
    setRows(newSettings.rows);
    setCols(newSettings.cols);
    setNumBombs(newSettings.bombs);

    // 2. ゲームの状態をリセット（handleFaceClickとほぼ同じ処理）
    setGameState('playing');
    setBombMap(null);
    setUserInputBoard(
      Array.from({ length: newSettings.rows }, () => Array(newSettings.cols).fill(0) as number[]),
    );
    setTime(0);
    setRemainingBombs(newSettings.bombs);
  };

  const formatNumber = (num: number) => {
    return String(num).padStart(3, '0');
  };

  const getFaceStyle = () => {
    // gameState の値によって、表示する画像の座標を返す
    switch (gameState) {
      case 'gameover':
        return { backgroundPosition: '-392px -2px' }; // ゲームオーバーの顔 (仮)
      case 'clear':
        return { backgroundPosition: '-362px -2px' }; // クリアの顔 (仮)
      case 'playing':
      default:
        return { backgroundPosition: '-332px -2px' }; // 通常の顔 (仮)
    }
  };

  const handleCellClick = (y: number, x: number) => {
    if (gameState !== 'playing') {
      return;
    }
    if (bombMap === null) {
      const newBombMap = generateRandomBombMap(rows, cols, numBombs, y, x);
      setBombMap(newBombMap);
      const newUserInputBoard = structuredClone(userInputBoard);
      openChain(y, x, newUserInputBoard, newBombMap, rows, cols);
      setUserInputBoard(newUserInputBoard);
    } else {
      //2回目以降
      if (userInputBoard[y][x] !== 0) {
        return;
      }
      if (bombMap[y][x] === 1) {
        setGameState('gameover');
        const newBoard = structuredClone(userInputBoard);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (bombMap[r][c] === 1) {
              newBoard[r][c] = 3;
            }
          }
        }
        setUserInputBoard(newBoard);
        return;
      }
      const newUserInputBoard = structuredClone(userInputBoard);
      openChain(y, x, newUserInputBoard, bombMap, rows, cols); //ずっと使い続けているbombMapを渡す。
      setUserInputBoard(newUserInputBoard);
    }
  };
  // 右クリック（旗・はてなを切り替える）
  const handleCellRightClick = (event: React.MouseEvent, y: number, x: number) => {
    if (gameState !== 'playing') {
      return;
    }
    event.preventDefault();

    const newUserInputBoard = structuredClone(userInputBoard);
    const currentColor = newUserInputBoard[y][x];

    // 0:未開封 -> 1:旗 -> 2:はてな -> 0:未開封
    if (currentColor === 0) {
      newUserInputBoard[y][x] = 1;
      setRemainingBombs((prevBombs) => prevBombs - 1);
    } else if (currentColor === 1) {
      newUserInputBoard[y][x] = 2;
      setRemainingBombs((prevBombs) => prevBombs + 1);
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

  const handleFaceClick = () => {
    console.log('ゲームをリセットします！');
    // 全てのstateを初期値に戻す
    setGameState('playing');
    setBombMap(null);
    setUserInputBoard(Array.from({ length: rows }, () => Array(cols).fill(0) as number[]));
    setTime(0);
    setRemainingBombs(numBombs);
  };
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined;

    if (gameState === 'playing' && bombMap !== null) {
      timerId = setInterval(() => {
        setTime((prevTime) => (prevTime < 999 ? prevTime + 1 : 999));
      }, 1000);
    }
    return () => {
      clearInterval(timerId);
    };
  }, [gameState, bombMap]);

  return (
    <div className={styles.container}>
      <div className={styles.difficultySelector}>
        <button onClick={() => handleDifficultyChange('beginner')}>初級</button>
        <button onClick={() => handleDifficultyChange('intermediate')}>中級</button>
        <button onClick={() => handleDifficultyChange('expert')}>上級</button>
      </div>
      <div className={styles.backGround}>
        {/* ★ヘッダー部分★ */}
        <div className={styles.header} style={{ width: cols * 30 }}>
          <div className={styles.counter}>{formatNumber(remainingBombs)}</div>
          <div className={styles.face} style={getFaceStyle()} onClick={handleFaceClick} />
          <div className={styles.counter}>{formatNumber(time)}</div>
        </div>
        <div
          className={styles.board}
          style={{
            width: cols * 30 + 2, // 1マスの幅を30px + ボーダー分と仮定
            height: rows * 30 + 2, // 1マスの高さを30px + ボーダー分と仮定
          }}
        >
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
                      : { backgroundPosition: 'none' }
                  }
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
