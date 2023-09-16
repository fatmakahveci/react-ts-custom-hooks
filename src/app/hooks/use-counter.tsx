'use client';

import { useState, useEffect } from 'react';

const useCounter = (forwards: boolean = true) => {
    const [counter, setCounter] = useState<number>(0);

    useEffect(() => {
      const interval: NodeJS.Timer = setInterval(() => {
        if (forwards) {
            setCounter((prevCounter: number) => prevCounter + 1);    
        } else {
            setCounter((prevCounter: number) => prevCounter - 1);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);

    return counter;
}
export default useCounter;