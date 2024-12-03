import React from 'react';
import { Coffee, Github } from 'lucide-react';
import Feedback from './Feedback';

const Footer = () => {
  return (
    <footer className="py-4 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/hussaino03/QuestLog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#77AAF7] dark:hover:text-[#77AAF7] transition-colors"
            aria-label="View source code on GitHub"
          >
            <Github className="w-4 h-4" />
            <span>Source</span>
          </a>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#77AAF7] dark:hover:text-[#77AAF7] transition-colors">
            <Feedback />
          </span>
          <span>•</span>
          <a
            href="https://ko-fi.com/hsz_11"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#77AAF7] dark:hover:text-[#77AAF7] transition-colors"
            aria-label="Support on Ko-fi"
          >
            <Coffee className="w-4 h-4" />
            <span>Like QuestLog?</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;