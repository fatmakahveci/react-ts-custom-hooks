'use client';

import { CardProps } from '@/shared/types';
import { FC } from 'react';
import './Card.css';

const Card: FC<CardProps> = ({ children }) => {
  return (
    <div className="card">
        {children}
    </div>
  )
}
export default Card;