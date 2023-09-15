'use client';

import Card from '@/app/components/UI/Card/Card';
import useCounter from '@/app/hooks/use-counter';
import './ForwardCounter.css';

const ForwardCounter = () => {
    const counter: number = useCounter();

  return <Card>{counter}</Card>;
};

export default ForwardCounter;
