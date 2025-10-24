
import React from 'react';
import { marked } from 'marked';

interface ResultDisplayProps {
  result: string;
}

// Basic markdown rendering using 'marked'. For a production app, consider a more robust library like react-markdown and sanitizing the HTML.
const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const parsedResult = marked.parse(result);

  return (
    <div className="w-full bg-gray-900/80 p-4 rounded-lg border border-gray-700 mt-4">
      <h2 className="text-lg font-semibold text-blue-400 mb-3">Analysis Result</h2>
      <div
        className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal"
        dangerouslySetInnerHTML={{ __html: parsedResult }}
      ></div>
    </div>
  );
};

export default ResultDisplay;
