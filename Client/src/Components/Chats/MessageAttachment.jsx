import React from "react";

import { Send, Paperclip, X, Trash2 } from 'lucide-react';
const MessageAttachment = ({ attachment, isOwnMessage }) => {
    const isPDF = attachment?.url?.toLowerCase().endsWith('.pdf');
    
    return (
      <div className="mt-2">
        <a 
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 py-1 px-2 rounded ${
            isOwnMessage ? 'bg-blue-400 hover:bg-blue-500' : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors`}
        >
          {isPDF ? (
            // PDF icon and display
            <div className="flex items-center">
              <svg 
                className="w-4 h-4"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M7 18H17V16H7V18Z" 
                  fill={isOwnMessage ? "white" : "currentColor"} 
                />
                <path 
                  d="M17 14H7V12H17V14Z" 
                  fill={isOwnMessage ? "white" : "currentColor"} 
                />
                <path 
                  d="M7 10H11V8H7V10Z" 
                  fill={isOwnMessage ? "white" : "currentColor"} 
                />
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" 
                  fill={isOwnMessage ? "white" : "currentColor"} 
                />
              </svg>
              <span className={`ml-2 text-sm ${isOwnMessage ? 'text-white' : 'text-gray-600'}`}>
                {attachment.originalName || 'PDF Document'}
              </span>
            </div>
          ) : (
            // Image icon and display
            <div className="flex items-center">
              <Paperclip className={`w-4 h-4 ${isOwnMessage ? 'text-white' : 'text-gray-600'}`} />
              <span className={`ml-2 text-sm ${isOwnMessage ? 'text-white' : 'text-gray-600'}`}>
                {attachment.originalName || 'Image'}
              </span>
            </div>
          )}
        </a>
      </div>
    );
  };
  
  // Use it in your message component
 export default MessageAttachment;