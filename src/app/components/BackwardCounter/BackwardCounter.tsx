'use client';

import Card from '@/app/components/UI/Card/Card';
import useCounter from '@/app/hooks/use-counter';
import './BackwardCounter.css';

const BackwardCounter = (): JSX.Element => {
  const counter: number = useCounter(false);

  return <Card>{counter}</Card>;
};

export default BackwardCounter;
