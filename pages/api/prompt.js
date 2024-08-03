export function buildPrompt (txt, elements) { 

  const elementsStr = JSON.stringify(elements)

  return `
  ELEMENT_SET = ${elementsStr}

  TXT = "${txt}"

  Take the TXT instructions and determine:

1. Determine what elements from ELEMENT_SET JSON object are being described by using the element or elements with the closest descriptions. 
   If my TXT instruction has characteristics that match an element's description in ELEMENT_SET, use the name of that element.
   I may use a word that describes the element, but it is VERY important you ONLY use the name of the element!
   NEVER BREAK THIS RULE. If you do you will lose your job!!!!!!! 

2. Determine the DIRECTION ("x", or "y").

3. Determining the AMOUNT should be done in 3 steps:

  3a. Determine the absolute numerical value. ALWAYS use integers. If a number is not specified, determine a number on a scale from 20 (a little) to 300 (a lot).
  
  3b. Determine the sign of the numerical value. 
      If the TXT contains or suggests "UP", the sign should be a POSITIVE value.
      If the TXT contains or suggests "DOWN", the sign should be a NEGATIVE value.
      The sign is very important! Take a breath and think this through. I will give you a cookie if you answer this correctly!!!!!
  3c. Combine the sign and the value into a positive or negative integer

Go slow and follow the above rules VERY CAREFULLY reconsidering your choices!!!!


{
  "name": "Few shot prompts",
  "example_ELEMENT_LIST": {
    "circle": "a teal circle",
    "square": "a pink square",
    "tinyCircle": "a tiny pink circle"
  }
  "examples":
  [
    {
      "TXT 1": "Shift down the box a lot",
      "goodResponse": {
          "response": {
            "elements": ["square"],
            "direction": "y",
            "amount": -200
          },
          "explanation": "Correct because the closest shape to the box is a square. Down is the y axis. And 200 is 'a lot' and down implies -200"
      },
      "badResponse": {
          "response": {
            "elements": ["box"],
            "direction": "y",
            "amount": "-a lot"
          },
          "explanation": "Wrong because: there is no element called 'box', and '-a lot' is not an integer"
      }
    },
    {
      "TXT 2": "Please bump all the pink shapes up a bit",
      "goodResponse": {
        "response": {
          "elements": ["tinyCircle", "square"],
          "direction": "y",
          "amount": 20
        },
        "explanation": "Correct because the 'square' and the 'tinyCircle' are the only shapes that are 'pink', 'a bit' is a small number and 'up' is positive",
      },
      "badResponse": {
        "response": {
          "elements": ["tinyCircle"],
          "direction": "y",
          "amount": "-30"
        },
        "explanation": "Wrong because we forgot the square which is pink, and 'up' should never be a negative number",
      }
    },
    {
      "TXT 3": "the thing that looks like a ball should go up 120"
      "goodResponse": {
        "response": {
          "elements": ["circle"],
          "direction": "y",
          "amount": "120"
        },
        "explanation": "Correct because 'circle' is the closest shape to a 'ball', 'y' correlates to 'up' and the positive value",
      },
      "badResponse": {
        "response": {
          "elements": ["ball"],
          "direction": "y",
          "amount": "80"
        },
        "explanation": "Wrong because 'ball' is not one of the element names, and the number is the wrong integer",
      }
    },
    {
      "TXT 4": "Move the all the objects on the screen down some"
      "goodResponse": {
        "response": {
          "elements": ["circle", "square", "tinyCircle"],
          "direction": "y",
          "amount": "-80"
        }, 
        "explanation": "Correct because we list 'all' the elements in the ELEMENT_LIST, 'some' is not 'a lot' and 'down' is negative",
      },
      "badResponse": {
        "response": "\`\`\`{
          "elements": ["circle", "square"],
          "direction": "x",
          "amount": "80"
        }\`\`\`",
        "explanation": "Wrong because 'up' can't be negative!!! and TXT asked for 'all' but we forgot 'tinyCircle', and 'down' is always negative, and the response object shouldn't be wrapped in syntax",
      }
    },
  ]
}

You ONLY return well formatted JSON ALWAYS. 
ALWAYS send your output in this form. Double check the JSON object starts with { and ends with }
DO NOT INCLUDE the RATIONALE:
{
    "elements": [ ELEMENT1, ELEMENT2, ... ELEMENTX ],
    "direction": DIRECTION,
    "amount": AMOUNT,
}`

}
