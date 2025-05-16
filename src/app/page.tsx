'use client';

import { useState } from 'react';
import styles from './page.module.css';
const calcTotalPoint = (arr: number[], counter: number) => {
  let i = 0;
  for (const j of arr) {
    i += j;
  }
  return i + counter;
};
const down = (n: number) => {
  if (n !== -1) {
    // console.log(n);
    down(n - 1);
  }
};
down(10);
const sum1 = (n: number): number => {
  if (n === 0) {
    return n;
  }
  return n + sum1(n - 1);
};
// console.log(sum1(10));

const sum2 = (k: number, l: number): number => {
  return k === l ? k : k + sum2(k + 1, l);
};
// console.log(sum2(3, 10));

const sum3 = (p: number, q: number): number => {
  return ((p + q) * (q - p + 1)) / 2;
};
console.log(sum3(4, 10));
export default function Home() {
  const [samplePoints, setSamplePoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  // console.log(samplePoints);
  const [sampleCounter, setSampleCounter] = useState(0);
  // console.log(sampleCounter);
  const clickHandler = () => {
    const newSamplePoints = structuredClone(samplePoints);
    newSamplePoints[sampleCounter] += 1;
    setSamplePoints(newSamplePoints);
    setSampleCounter((sampleCounter + 1) % 14);
  };
  const TotalPoint = calcTotalPoint(samplePoints, sampleCounter);
  // console.log(TotalPoint);

  return (
    <div className={styles.container}>
      <div
        className={styles.sampleCell}
        style={{ backgroundPosition: `${-30 * sampleCounter}px ` }}
      />
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
