'use client';

import { useState, useEffect } from 'react';

const useCounter = () => {
    const [counter, setCounter] = useState<number>(0);

    useEffect(() => {
      const interval: NodeJS.Timer = setInterval(() => {
        setCounter((prevCounter: number) => prevCounter - 1);
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);

    return counter;
}
export default useCounter;