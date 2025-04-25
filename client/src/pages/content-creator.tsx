import { useRef } from 'react';
import ContentEditor from '@/components/content-creator/ContentEditor';
import OptimizationPanel from '@/components/content-creator/OptimizationPanel';
import CalendarPreview from '@/components/content-creator/CalendarPreview';

export default function ContentCreator() {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Content Creator</h1>
        <p className="text-muted-foreground">Create and optimize LinkedIn posts</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Editor */}
        <div className="md:col-span-2" ref={editorRef}>
          <ContentEditor />
          <CalendarPreview />
        </div>
        
        {/* Content Optimization Panel */}
        <div>
          <OptimizationPanel />
        </div>
      </div>
    </div>
  );
}
