import React from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  expiresAt: number;
  now: number;
  totalDurationMs?: number;
}

export function CountdownTimer({
  expiresAt,
  now,
  totalDurationMs = 5 * 60 * 1000,
}: CountdownTimerProps) {
  const remainingMs = Math.max(0, expiresAt - now);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));
  const isUrgent = remainingSeconds <= 30;

  const timerTextClassName = isUrgent
    ? 'countdown-timer__value countdown-timer__value--urgent'
    : 'countdown-timer__value';

  const progressBarClassName = isUrgent
    ? 'countdown-timer__bar countdown-timer__bar--urgent'
    : 'countdown-timer__bar';

  return (
    <div className="countdown-timer">
      <div className="countdown-timer__top">
        <span className="countdown-timer__label">Time remaining</span>
        <span className={timerTextClassName}>
          {remainingMinutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="countdown-timer__track">
        <motion.div
          className={progressBarClassName}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
