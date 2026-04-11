/* src/components/CountdownSection.jsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CountdownSection.css';

const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);
  return time;
};

const AnimatedDigit = ({ value, label, isMarriage }) => {
  const padded = String(value).padStart(2, '0');
  return (
    <motion.div
      className={`countdown-unit ${isMarriage ? 'marriage' : 'engagement'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="digit-wrap">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={padded}
            className="digit-value"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="digit-label">{label}</span>
    </motion.div>
  );
};

const CountdownSection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';
  const { days, hours, minutes, seconds } = useCountdown(data.eventDate);
  const isPast = new Date(data.eventDate) <= new Date();

  return (
    <section className={`countdown-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      {/* Decorative glow */}
      <div className={`countdown-glow ${isMarriage ? 'marriage' : 'engagement'}`} />

      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ The Day Approaches ♡</p>
          <h2 className="countdown-heading">
            {isPast ? 'The Day Has Arrived! 🎉' : 'Counting Down To Forever'}
          </h2>
          <div className={`section-divider ${isMarriage ? 'marriage' : 'engagement'}`} />
        </motion.div>

        {!isPast ? (
          <div className="countdown-grid">
            <AnimatedDigit value={days}    label="Days"    isMarriage={isMarriage} />
            <div className="countdown-colon">:</div>
            <AnimatedDigit value={hours}   label="Hours"   isMarriage={isMarriage} />
            <div className="countdown-colon">:</div>
            <AnimatedDigit value={minutes} label="Minutes" isMarriage={isMarriage} />
            <div className="countdown-colon">:</div>
            <AnimatedDigit value={seconds} label="Seconds" isMarriage={isMarriage} />
          </div>
        ) : (
          <motion.div
            className="countdown-arrived"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎊 The celebration is here! 🎊
          </motion.div>
        )}

        <motion.div
          className={`countdown-event-info ${isMarriage ? 'marriage' : 'engagement'}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <span>
            {isMarriage ? '💒 Wedding Ceremony' : '💍 Engagement Ceremony'}&nbsp;·&nbsp;
            {data.events[isMarriage ? 4 : 0]?.date}&nbsp;·&nbsp;
            {data.events[isMarriage ? 4 : 0]?.time}
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default CountdownSection;