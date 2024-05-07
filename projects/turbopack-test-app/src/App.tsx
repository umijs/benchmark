import React from 'react';
import './App.css';

import Triangle from './comps/triangle';

export function App() {
  return (
    <svg height="100%" viewBox="-5 -4.33 10 8.66" style={{ backgroundColor: "black" }}>
        <Triangle style={{ fill: "white" }}/>
    </svg>
  );
}
