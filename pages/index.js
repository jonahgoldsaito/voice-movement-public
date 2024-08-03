import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import LinearProgress from '@mui/material/LinearProgress';
import { useAnimate } from 'framer-motion';
import { Cursor } from './cursor';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [spokenTxt, setSpokenTxt] = useState("");
  const [output, setOutput] = useState("");
  const [circleScope, animateCircle] = useAnimate();
  const [tinyCircleScope, animateTinyCircle] = useAnimate();
  const [squareScope, animateSquare] = useAnimate();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [elements, setElements] = useState({});
  const elementsRef = useRef(elements);

  //  Build the elements object from the nodes in the #elements node
  useEffect(() => {
    const elementNodes = document.querySelectorAll("#elements > *");
    let newElements = {...elements};
    elementNodes.forEach(node => {
      newElements[node.id] = { "name": node.id, "description": node.getAttribute("description") };
    });
    setElements(newElements);
    console.log(newElements)
  }, []);

  

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);


  useEffect(() => {
    const micElement = document.getElementById("mic");

    if (micElement) {
      document.addEventListener('click', function() {

        if (recognitionRef.current) return;

        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        setIsRecording(true);

        recognition.onresult = function(event) {
            var speechToText = event.results[0][0].transcript;
            setSpokenTxt(speechToText);
            sendRequestToServer(speechToText);
        };

        recognition.onerror = function(event) {
            console.error('Speech Recognition Error:', event.error);
            recognitionRef.current = null;
        };

        recognition.onend = function() {
            console.log('Speech Recognition ended.');
            setIsRecording(false);
            recognitionRef.current = null;
        };
      });
    }
  }, []);

  async function sendRequestToServer(txt) {
    try {
      const obj = {
        txt: txt,
        elements: {...elementsRef.current}
      }
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });

      const data = await response.json();
      if (response.status !== 200) {
        setIsLoading(false);
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      const result = JSON.parse(data.result);      
      animateDiv(result.elements, result.direction, result.amount);
    } catch(error) {
      console.error(error);
    }
    setIsLoading(false);

  }


  useEffect(() => {
    setOutput( output + " / " + spokenTxt);
  }, [spokenTxt]);


  function showLoader(){
    const loaderDOM = <div style={{ width: '100%', position: 'fixed', bottom: '0', left: 0 }}>
      <LinearProgress />
    </div>
    
    if (isLoading)
      return loaderDOM; 
    else
      return;
  }


  const animateDiv = async (elementIDs, direction, amount) => {

    for (let i = 0; i < elementIDs.length; i++) {
      const elementId = elementIDs[i];
      const element = document.getElementById(elementId);
      let controls;
      let scope;
      switch (elementId) {
        case 'circle':
          controls = animateCircle;
          scope = circleScope;
          break;
        case 'square':
          controls = animateSquare;
          scope = squareScope;
          break;
          case 'tinyCircle':
            controls = animateTinyCircle;
            scope = tinyCircleScope;
            break;
        default:
          console.error('Invalid elementId');
          return;
      }
      if (element && 
          (direction === "x" || direction === "y") &&
          amount >= 0 || amount < 0) {
        const sign = direction === 'x' ? 1 : -1;

        const style = window.getComputedStyle(element);
        const matrix = new WebKitCSSMatrix(style.transform);
        const original = direction === 'x' ? matrix.m41 : matrix.m42;
        const newValue = sign*amount + original;
        await controls( scope.current, 
          {
            [direction]: newValue + "px",
        });
      }
    }
  };


  return (
    <div>
      <Head>
        <title>Voice Controlled Shapes</title>
      </Head>

      <main className={styles.main}>
          {showLoader()}


          <div id="txt" className={styles.output}>     
               {output}
          </div>

        <div id="elements" className={styles.elements}>
          
          <div id="circle" 
            className={styles.circle} 
            ref={circleScope}
            description="a teal circle with a hole in the middle" />
          <div id="square" 
            className={styles.square} 
            ref={squareScope}
            description="a pink square" />
          <div id="tinyCircle" 
            className={styles.tinyCircle} 
            ref={tinyCircleScope}
            description="a tiny pink circle" />
        </div>

        <img id="mic" src="mic_big.png" alt="microphone" className={isRecording ? styles.mic : styles.micHidden} />


        <Cursor show={!isRecording} />

        <div className={styles.grid} />

      </main>
    </div>
  );
}
