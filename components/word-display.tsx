"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getFontFamilyClass, getFontSizeClass } from "@/lib/user-settings";
import { useTheme } from "next-themes";

interface WordDisplayProps {
  text: string;
  userInput: string;
  fontFamily?: "mono" | "sans" | "serif";
  fontSize?: "small" | "medium" | "large";
  caretStyle?: "block" | "underline" | "outline" | "straight" | "cursor";
  caretBlink?: boolean;
  maxLines?: number;
}

export function WordDisplay({
  text,
  userInput,
  fontFamily = "mono",
  fontSize = "large",
  caretStyle = "block",
  caretBlink = false,
  maxLines = 3,
}: WordDisplayProps) {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [visibleTextRange, setVisibleTextRange] = useState({
    start: 0,
    end: 0,
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Calculate how much text should be visible to show exactly 3 lines
  useEffect(() => {
    if (!textContainerRef.current) return;

    const container = textContainerRef.current;

    // Create a temporary span to measure line height
    const tempSpan = document.createElement("span");
    tempSpan.textContent = "X";
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.fontSize = getComputedStyle(container).fontSize;
    tempSpan.style.lineHeight = getComputedStyle(container).lineHeight;
    container.appendChild(tempSpan);
    const measuredLineHeight = tempSpan.offsetHeight;
    setLineHeight(measuredLineHeight);
    container.removeChild(tempSpan);

    // Calculate how many characters can fit in the container
    const calculateTextRange = () => {
      // Create a test container to measure text wrapping
      const testContainer = document.createElement("div");
      testContainer.style.visibility = "hidden";
      testContainer.style.position = "absolute";
      testContainer.style.width = `${container.clientWidth}px`;
      testContainer.style.fontSize = getComputedStyle(container).fontSize;
      testContainer.style.lineHeight = getComputedStyle(container).lineHeight;
      testContainer.style.whiteSpace = "pre-wrap";
      testContainer.style.wordBreak = "break-word";
      container.appendChild(testContainer);

      // Focus on the current typing position
      const currentPosition = userInput.length;

      // Calculate line breaks
      const charsPerLine = Math.floor(
        container.clientWidth /
          (parseInt(getComputedStyle(container).fontSize) * 0.6)
      );
      const approximateLineStart = Math.max(
        0,
        currentPosition - (currentPosition % charsPerLine)
      );

      // Start from the beginning of the current line
      let start = approximateLineStart;

      // If not on the first line, include the previous line as well
      if (start > 0) {
        start = Math.max(0, start - charsPerLine);
        // Ensure we don't start in the middle of a word
        const prevSpace = text.lastIndexOf(" ", start);
        if (prevSpace !== -1) start = prevSpace + 1;
      }

      // Show enough text for maxLines (3 lines by default)
      let end = Math.min(text.length, start + charsPerLine * maxLines);

      // Test how many characters fit into maxLines
      let visibleText = text.substring(start, end);
      testContainer.textContent = visibleText;

      // Adjust the text until it fits into maxLines
      while (
        testContainer.clientHeight > measuredLineHeight * maxLines &&
        end > currentPosition + 50
      ) {
        end -= 10;
        visibleText = text.substring(start, end);
        testContainer.textContent = visibleText;
      }

      // Make sure the text ends with a complete word
      const lastSpace = visibleText.lastIndexOf(" ");
      if (lastSpace !== -1 && lastSpace > visibleText.length - 20) {
        end = start + lastSpace;
      }

      container.removeChild(testContainer);
      setVisibleTextRange({ start, end });
    };

    calculateTextRange();

    // Re-calculate on window resize or typing position change
    window.addEventListener("resize", calculateTextRange);
    return () => window.removeEventListener("resize", calculateTextRange);
  }, [text, userInput, maxLines]);

  // Get caret style class based on the selected caret style - minimalistic without transitions
  const getCaretStyleClass = () => {
    switch (caretStyle) {
      case "block":
        return `bg-teal-500/70`;
      case "underline":
        return `border-b-2 border-teal-500`;
      case "outline":
        return `border border-teal-500 bg-teal-500/10`;
      case "straight":
        return `border-l-2 border-teal-500`;
      case "cursor":
        return `border-l-[2px] border-teal-400`;
      default:
        return `border-l-[2px] border-teal-400`;
    }
  };

  const caretStyleClass = getCaretStyleClass();
  const caretBlinkClass = caretBlink ? "animate-caret-blink" : "";

  // Compute the visible text
  const visibleText = text.substring(
    visibleTextRange.start,
    visibleTextRange.end
  );

  // Fixed height for lines based on calculated line height
  const containerHeight = lineHeight * maxLines + 50; // 50px for padding (16px top + 16px bottom)

  return (
    <div
      className={cn(
        // "w-full max-w-7xl mx-auto p-4 rounded-lg typing-text whitespace-pre-wrap overflow-hidden relative",
        // isDark ? "bg-slate-800/50 text-slate-200" : "bg-slate-100/70 text-slate-800",
        "w-full max-w-7xl mx-auto p-4 rounded-lg typing-text whitespace-pre-wrap overflow-hidden relative",
        isDark ? "text-slate-200" : "text-slate-800",
        getFontFamilyClass(fontFamily),
        getFontSizeClass(fontSize)
      )}
      ref={textContainerRef}
      style={{ height: `${containerHeight}px` }}
    >
      {/* <div className="absolute inset-0 p-4 whitespace-pre-wrap break-words overflow-hidden flex items-center justify-center">
        <div className="max-w-full text-center">
          {text.split('').map((char, index) => {
            // Only render characters within the visible range
            if (index < visibleTextRange.start || index >= visibleTextRange.end) {
              return null;
            }
            
            // Adjust index for highlighting
            const adjustedIndex = index - visibleTextRange.start;
            const inputIndex = index;
            
            let className = "opacity-70"; // Default style without transition
            
            if (index < userInput.length) {
              // User has typed this character
              className = userInput[index] === char 
                ? "text-teal-500 opacity-100" // Correct
                : "text-red-500 opacity-100 border-b border-red-500"; // Incorrect
            } else if (index === userInput.length) {
              // Current character to type
              className = cn(caretStyleClass, caretBlinkClass, "opacity-100");
            }
            
            return (
              <span key={index} className={cn(className)}>
                {char}
              </span>
            );
          })}
        </div>
      </div> */}
      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="max-w-full h-full">
          <div className="text-justify leading-relaxed">
            {text.split("").map((char, index) => {
              // Only render characters within the visible range
              if (
                index < visibleTextRange.start ||
                index >= visibleTextRange.end
              ) {
                return null;
              }

              // Adjust index for highlighting
              const adjustedIndex = index - visibleTextRange.start;
              const inputIndex = index;

              let className = "opacity-70"; // Default style - no transitions to prevent text vibration

              if (index < userInput.length) {
                // User has typed this character - no transitions for stability
                className =
                  userInput[index] === char
                    ? `${isDark ? "text-slate-100" : "text-slate-900"} opacity-100` // Correct
                    : "text-red-500 opacity-100 bg-red-500/10"; // Incorrect - removed underline
              } else if (index === userInput.length) {
                // Current character - minimalistic cursor without background effects
                className = cn(
                  caretStyleClass, 
                  caretBlinkClass, 
                  "opacity-100",
                  isDark ? "text-slate-300" : "text-slate-700" // Subtle text color, no blocking
                );
              }

              return (
                <span 
                  key={index} 
                  className={cn(className)}
                  style={{
                    display: 'inline',
                    letterSpacing: 'inherit'
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client"

// import { useRef, useEffect, useState } from 'react';
// import { cn } from '@/lib/utils';
// import { getFontFamilyClass, getFontSizeClass } from '@/lib/user-settings';
// import { useTheme } from 'next-themes';

// interface WordDisplayProps {
//   text: string;
//   userInput: string;
//   fontFamily?: 'mono' | 'sans' | 'serif';
//   fontSize?: 'small' | 'medium' | 'large';
//   caretStyleClass?: string;
//   maxLines?: number;
// }

// export function WordDisplay({
//   text,
//   userInput,
//   fontFamily = 'mono',
//   fontSize = 'large',
//   caretStyleClass = 'bg-primary/20',
//   maxLines = 4
// }: WordDisplayProps) {
//   const textContainerRef = useRef<HTMLDivElement>(null);
//   const [lineHeight, setLineHeight] = useState(0);
//   const [visibleTextRange, setVisibleTextRange] = useState({ start: 0, end: 0 });
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   // Calculate how much text should be visible to show exactly 4 lines
//   useEffect(() => {
//     if (!textContainerRef.current) return;

//     const container = textContainerRef.current;

//     // Create a temporary span to measure line height
//     const tempSpan = document.createElement('span');
//     tempSpan.textContent = 'X';
//     tempSpan.style.visibility = 'hidden';
//     tempSpan.style.position = 'absolute';
//     tempSpan.style.fontSize = getComputedStyle(container).fontSize;
//     tempSpan.style.lineHeight = getComputedStyle(container).lineHeight;
//     container.appendChild(tempSpan);
//     const measuredLineHeight = tempSpan.offsetHeight;
//     setLineHeight(measuredLineHeight);
//     container.removeChild(tempSpan);

//     // Calculate how many characters can fit in the container
//     const calculateTextRange = () => {
//       // Create a test container to measure text wrapping
//       const testContainer = document.createElement('div');
//       testContainer.style.visibility = 'hidden';
//       testContainer.style.position = 'absolute';
//       testContainer.style.width = `${container.clientWidth}px`;
//       testContainer.style.fontSize = getComputedStyle(container).fontSize;
//       testContainer.style.lineHeight = getComputedStyle(container).lineHeight;
//       testContainer.style.whiteSpace = 'pre-wrap';
//       testContainer.style.wordBreak = 'break-word';
//       container.appendChild(testContainer);

//       // Focus on the current typing position
//       const currentPosition = userInput.length;

//       // Calculate line breaks
//       const charsPerLine = Math.floor(container.clientWidth / (parseInt(getComputedStyle(container).fontSize) * 0.6));

//       let start = 0;

//       // If we have typed more than 2 lines worth, shift the window
//       if (currentPosition > charsPerLine * 2) {
//         // Calculate which line we're currently on
//         const currentLine = Math.floor(currentPosition / charsPerLine);

//         // If we're on line 3 or beyond, shift up by one line
//         if (currentLine >= 2) {
//           start = charsPerLine * (currentLine - 1);
//           // Align to word boundary if possible
//           const prevSpace = text.lastIndexOf(' ', start);
//           if (prevSpace !== -1 && start - prevSpace < charsPerLine * 0.3) {
//             start = prevSpace + 1;
//           }
//         }
//       }

//       // Calculate end position to show exactly maxLines worth of text
//       let end = Math.min(text.length, start + (charsPerLine * maxLines * 1.5));

//       // Use binary search to find the exact text that fills maxLines
//       let low = start + (charsPerLine * maxLines);
//       let high = Math.min(text.length, start + (charsPerLine * maxLines * 2));
//       let bestEnd = end;

//       const targetHeight = measuredLineHeight * maxLines;

//       while (low <= high) {
//         const mid = Math.floor((low + high) / 2);
//         const visibleText = text.substring(start, mid);
//         testContainer.textContent = visibleText;

//         const currentHeight = testContainer.clientHeight;

//         if (currentHeight <= targetHeight) {
//           bestEnd = mid;
//           low = mid + 1;
//         } else {
//           high = mid - 1;
//         }
//       }

//       // Ensure we don't cut off mid-word at the end
//       if (bestEnd < text.length) {
//         const nextSpace = text.indexOf(' ', bestEnd);
//         const prevSpace = text.lastIndexOf(' ', bestEnd);

//         // Try to extend to next space if it's close
//         if (nextSpace !== -1 && nextSpace - bestEnd < 15) {
//           const testText = text.substring(start, nextSpace);
//           testContainer.textContent = testText;
//           if (testContainer.clientHeight <= targetHeight) {
//             bestEnd = nextSpace;
//           }
//         }
//         // Otherwise try to end at previous space
//         else if (prevSpace !== -1 && bestEnd - prevSpace < 15) {
//           bestEnd = prevSpace;
//         }
//       }

//       // Final check: ensure we always show at least maxLines worth of content
//       const finalText = text.substring(start, bestEnd);
//       testContainer.textContent = finalText;
//       const finalHeight = testContainer.clientHeight;

//       // If we don't have enough text to fill maxLines, try to get more
//       if (finalHeight < targetHeight * 0.9 && bestEnd < text.length) {
//         // Try to add more text
//         let additionalEnd = Math.min(text.length, bestEnd + charsPerLine);
//         const additionalText = text.substring(start, additionalEnd);
//         testContainer.textContent = additionalText;

//         if (testContainer.clientHeight <= targetHeight) {
//           bestEnd = additionalEnd;
//         }
//       }

//       container.removeChild(testContainer);
//       setVisibleTextRange({ start, end: bestEnd });
//     };

//     calculateTextRange();

//     // Re-calculate on window resize or typing position change
//     window.addEventListener('resize', calculateTextRange);
//     return () => window.removeEventListener('resize', calculateTextRange);
//   }, [text, userInput, maxLines]);

//   // Compute the visible text
//   const visibleText = text.substring(visibleTextRange.start, visibleTextRange.end);

//   // Fixed height for 4 lines based on calculated line height
//   const containerHeight = Math.max(250, lineHeight * maxLines + 32); // 32px for padding

//   return (
//     <div
//       className={cn(
//         "w-full max-w-7xl mx-auto p-4 rounded-lg typing-text whitespace-pre-wrap overflow-hidden relative",
//         isDark ? "bg-slate-800/50 text-slate-200" : "bg-slate-100/70 text-slate-800",
//         getFontFamilyClass(fontFamily),
//         getFontSizeClass(fontSize)
//       )}
//       ref={textContainerRef}
//       style={{ minHeight: `${containerHeight}px`, maxHeight: `${containerHeight}px` }}
//     >
//       <div className="absolute inset-0 p-4 whitespace-pre-wrap break-words line-clamp-4 overflow-hidden leading-tight">
//         {text.split('').map((char, index) => {
//           // Only render characters within the visible range
//           if (index < visibleTextRange.start || index >= visibleTextRange.end) {
//             return null;
//           }

//           let className = "opacity-70"; // Default style

//           if (index < userInput.length) {
//             // User has typed this character
//             className = userInput[index] === char
//               ? "text-green-500 opacity-100" // Correct
//               : "text-red-500 opacity-100 border-b border-red-500"; // Incorrect
//           } else if (index === userInput.length) {
//             // Current character to type
//             className = cn(caretStyleClass, "opacity-100");
//           }

//           return (
//             <span key={index} className={cn(className)}>
//               {char}
//             </span>
//           );
//         })}
//       </div>
//     </div>
//   );
// }