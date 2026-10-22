import { useState } from 'react';

interface CounterProps {
  label: string;
}

function Counter({ label }: CounterProps) {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  return (
    <button type="button" className="counter" onClick={increment}>
      {label}: {count}
    </button>
  );
}

export default Counter;
