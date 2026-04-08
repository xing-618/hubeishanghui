// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FileText, Image as ImageIcon } from 'lucide-react';

const RichTextDisplay = ({
  content,
  className = ''
}) => {
  return <div className={`rich-text-content ${className}`}>
      {content ? <div dangerouslySetInnerHTML={{
      __html: content || '<p>暂无介绍</p>'
    }} className="prose prose-slate max-w-none" style={{
      fontSize: '14px',
      lineHeight: '1.8',
      color: '#4A5568'
    }} /> : <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无介绍</p>
          </div>
        </div>}
    </div>;
};
export default RichTextDisplay;