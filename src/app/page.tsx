'use client';

import { useState } from 'react';
import styles from './page.module.css';

const userInput: number[][] = [
  [0, 0, 1, 3],
  [3, 0, 2, 0],
  [0, 0, 0, 3],
  [0, 1, 3, 2],
]; // 0:何もしない 1:旗 2:はてな 3:開く

const bombMap: number[][] = [
  [0, 0, 0, 1],
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1],
]; //0:何もない 1:爆弾がある

const calcMap = (userInput: number[][], bombMap: number[][]) => {
  return structuredClone(userInput);
};

export default function Home() {
  const [board, setBoard] = useState(userInput);

  const handleCellClick = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    newBoard[y][x] = 3;
    setBoard(newBoard);
  };
  const getBackgroundPosition = (cellValue: number) => {
    switch (cellValue) {
      case 0: // 未開封
        return '-30px -30px';
      case 1: // 旗
        return '-270px 0px';
      case 2: // はてな
        return '-240px 0px';
      case 3: // 開いたセル
        return '-210px 0px';
      default:
        return '0px 0px'; // デフォルト
    }
  };

  return (
    <div className={styles.container}>
      <h1>マインスイーパー</h1>
      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${cell === 3 ? styles.opened : ''}`} /* cellValueが3ならopenedクラスを適用 */
                style={
                  getBackgroundPosition(cell)
                    ? { backgroundPosition: getBackgroundPosition(cell) }
                    : { backgroundPosition: 'none' }
                }
                onClick={() => handleCellClick(rowIndex, colIndex)} // rowIndex, colIndexを渡す
                // x={rowIndex}
                // y={cellIndex}
                // value={cell}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
