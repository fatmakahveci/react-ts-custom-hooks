"use client";

import BackwardCounter from '@/app/components/BackwardCounter/BackwardCounter';
import ForwardCounter from '@/app/components/ForwardCounter/ForwardCounter';
import './globals.css';

const Home = ({ }): JSX.Element => {
  return (
    <>
      <ForwardCounter />
      <BackwardCounter />
    </>
  )
}

export default Home;