'use client';

import Card from '@/app/components/UI/Card/Card';
import { useEffect, useState } from 'react';
import './BackwardCounter.css';

const BackwardCounter = () => {
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    const interval: NodeJS.Timer = setInterval(() => {
      setCounter((prevCounter: number) => prevCounter - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Card>{counter}</Card>;
};

export default BackwardCounter;
