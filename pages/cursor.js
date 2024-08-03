import { useState, useEffect, useRef } from "react";
import styles from "./cursor.module.css";

export const Cursor = ({ show }) => {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const mousePositionRef = useRef(mousePosition);
  const cursorPositionRef = useRef(cursorPosition);



  useEffect(() => {
    mousePositionRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    cursorPositionRef.current = cursorPosition;
  }, [cursorPosition]);

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
  
      const delay = 0.15;
      const newMousePosition = { 
        x: cursorPositionRef.current.x + (mousePositionRef.current.x - cursorPositionRef.current.x) * delay, 
        y: cursorPositionRef.current.y + (mousePositionRef.current.y - cursorPositionRef.current.y) * delay
      }
      setCursorPosition(newMousePosition);
    }, 15);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const cursorStyle = {
    left: `${cursorPosition.x}px`,
    top: `${cursorPosition.y}px`,
    opacity: show ? 1 : 0,
    transition: 'opacity 0.25s ease-in-out'
  };

  return (
    <div id="cursor-trail" src="mic.png" alt="cursor trail" className={styles.cursorTrail} style={cursorStyle} />
  );
}
