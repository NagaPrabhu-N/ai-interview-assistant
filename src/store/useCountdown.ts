import { useState, useEffect } from 'react';

export const useCountdown = (initialSeconds: number, onTimeUp: () => void) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    if (secondsLeft === 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, isActive, onTimeUp]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    setIsActive(false);
    setSecondsLeft(initialSeconds);
  };

  return { secondsLeft, start, pause, reset };
};
