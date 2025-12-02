import React from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  /** Full string to render */
  text: string;
  /** Case-insensitive words or phrases to highlight */
  searchWords: string[];
  /** Style applied to the highlighted parts */
  highlightStyle?: TextStyle;
  /** Style applied to the non-highlighted parts */
  textStyle?: TextStyle;
}

/* Escape characters that have special meaning in regexes */
function escapeRegex(str: string): string {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default function Highlighter({
  text,
  searchWords,
  highlightStyle,
  textStyle,
}: Props) {
  if (!text || searchWords.length === 0) {
    return <Text style={textStyle}>{text}</Text>;
  }

  /* Build one big "(word1|word2|word3)" regex, case-insensitive */
  const pattern = new RegExp(
    `(${searchWords.map(escapeRegex).join('|')})`,
    'gi',
  );

  const parts = text.split(pattern);

  return (
    <Text>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <Text key={i} style={highlightStyle}>
            {part}
          </Text>
        ) : (
          <Text key={i} style={textStyle}>
            {part}
          </Text>
        ),
      )}
    </Text>
  );
}
