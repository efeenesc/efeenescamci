/* eslint-disable @typescript-eslint/prefer-for-of */
import { MdWrapChar } from "./index.interface";

export function lex(mdstr: string): string[][] {
  // Split the input string into lines
  const lines: string[] = mdstr.split("\n");

  // Process each line
  const result = lines.map((line: string) => {
      const splitTokens: string[] = line.split(" ");
      const tokens = new Array(splitTokens.length * 2 - 1);

      // Loop over splitTokens and add the split whitespace back to 'tokens'
      for (let i = 0, j = 0; i < splitTokens.length; i++) {
          tokens[j++] = splitTokens[i];
          if (i < splitTokens.length - 1) {
              tokens[j++] = " ";
          }
      }
      const processedTokens: string[] = [];

      tokens.forEach((token) => {
          const newTokens: string[] = processToken(token);
          processedTokens.push(...newTokens);
      });

      return processedTokens;
  });

  return result;
}

function processToken(token: string): string[] {
  const newTokens: string[] = [];
  const buffer: string[] = [];
  let isSpecial = false;
  let specialRepeat = 0;
  let lastChar = "";

  for (let i = 0; i < token.length; i++) {
      const char = token[i];

      if (MdWrapChar.includes(char)) {
          handleSpecialChar(
              char,
              newTokens,
              buffer,
              isSpecial,
              specialRepeat,
              lastChar
          );

          isSpecial = true;
          specialRepeat =
              char === lastChar || specialRepeat === 0
                  ? specialRepeat + 1
                  : 1;
      } else if (isSpecial) {
          handleNonSpecialCharAfterSpecial(
              char,
              newTokens,
              buffer,
              lastChar,
              specialRepeat
          );
          isSpecial = false;
          specialRepeat = 0;
      } else {
          buffer.push(char);
      }

      lastChar = char;
  }

  flushBuffer(newTokens, buffer);
  if (isSpecial) {
      newTokens.push(lastChar.repeat(specialRepeat));
  }

  return newTokens;
}

function handleSpecialChar(
  char: string,
  newTokens: string[],
  buffer: string[],
  isSpecial: boolean,
  specialRepeat: number,
  lastChar: string
) {
  if (isSpecial && char !== lastChar) {
      flushBuffer(newTokens, buffer);
      newTokens.push(lastChar.repeat(specialRepeat));
  } else if (!isSpecial) {
      flushBuffer(newTokens, buffer);
  }
}

function handleNonSpecialCharAfterSpecial(
  char: string,
  newTokens: string[],
  buffer: string[],
  lastChar: string,
  specialRepeat: number
) {
  flushBuffer(newTokens, buffer);
  newTokens.push(lastChar.repeat(specialRepeat));
  buffer.push(char);
}

function flushBuffer(
  newTokens: string[],
  buffer: string[],
  isSpecial = false,
  lastChar = "",
  specialRepeat = 0
) {
  if (buffer.length > 0) {
      newTokens.push(buffer.join(""));
      buffer.length = 0; // Clear the buffer
  }
  if (isSpecial) {
      newTokens.push(lastChar.repeat(specialRepeat));
  }
}