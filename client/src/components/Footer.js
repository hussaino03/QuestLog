import React from 'react';
import { Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex justify-center items-center gap-2">
        <span>Like QuestLog?</span>
        <a
          href="https://ko-fi.com/hsz_11"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#77AAF7] dark:hover:text-[#77AAF7] transition-colors"
          aria-label="Support on Ko-fi"
        >
          <Coffee className="w-4 h-4" />
          <span>Support the project</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;