import React, { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0); // estado inicial 0

  const handleClick = () => {
    setCount(count + 1); // actualiza el estado
  };

  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={handleClick}>Sumar</button>
    </div>
  );
}
