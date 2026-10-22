import { useState } from 'react';

interface ToggleProps {
  label: string;
}

function Toggle({ label }: ToggleProps) {
  const [on, setOn] = useState(false);

  function flip() {
    setOn(!on);
  }

  return (
    <button type="button" className="toggle" onClick={flip}>
      {label}: {on ? 'on' : 'off'}
    </button>
  );
}

export default Toggle;
