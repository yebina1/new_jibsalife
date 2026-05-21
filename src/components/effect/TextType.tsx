import { useState, useEffect } from 'react';

type TextTypeProps = {
  text: string;
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
};

export function TextType({ text, typingSpeed = 90, pauseDuration = 2200, className }: TextTypeProps) {
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (displayed.length < text.length) {
        id = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), typingSpeed);
      } else {
        id = setTimeout(() => setPhase('pause'), pauseDuration);
      }
    } else if (phase === 'pause') {
      setPhase('deleting');
    } else {
      if (displayed.length > 0) {
        id = setTimeout(() => setDisplayed(displayed.slice(0, -1)), typingSpeed / 2);
      } else {
        setPhase('typing');
      }
    }

    return () => clearTimeout(id);
  }, [displayed, phase, text, typingSpeed, pauseDuration]);

  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span className="text_type_cursor" aria-hidden="true" style={{ opacity: cursorOn ? 1 : 0 }}>|</span>
    </span>
  );
}
