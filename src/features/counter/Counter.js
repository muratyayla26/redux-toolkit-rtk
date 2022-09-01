import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, reset, incByAmount } from "./counterSlice";

const Counter = () => {
  const [incAmount, setIncAmount] = useState(0);
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  const addValue = Number(incAmount) || 0;

  const resetAll = () => {
    setIncAmount(0);
    dispatch(reset());
  };

  return (
    <section>
      <p>{count}</p>
      <div>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(decrement())}>-</button>
      </div>
      <input
        type="text"
        value={incAmount}
        onChange={(e) => setIncAmount(e.target.value)}
      />
      <div>
        <button onClick={() => dispatch(incByAmount(addValue))}>
          Add Amount
        </button>
        <button onClick={resetAll}>Reset</button>
      </div>
    </section>
  );
};

export default Counter;
