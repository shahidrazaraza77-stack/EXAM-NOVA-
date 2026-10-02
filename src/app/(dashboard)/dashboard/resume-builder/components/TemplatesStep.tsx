import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LayoutTemplate, CheckCircle2, ArrowRight } from "lucide-react";
import { mockTemplates } from "../mockData";

interface TemplatesStepProps {
  onNext: () => void;
}

export default function TemplatesStep({ onNext }: TemplatesStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h3 className="font-bold text-2xl">Select a Template</h3>
        <p className="text-sm text-zinc-500">
          Choose a design that fits your industry. All templates are ATS-friendly and optimized for readability.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                isSelected 
                  ? "border-indigo-600 shadow-lg shadow-indigo-500/10 scale-[1.02]" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Mock Preview Thumbnail */}
              <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative p-4 flex flex-col gap-2 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                {/* Header mock */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-2 w-1/3 rounded-full ${template.id === 'minimal' ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-indigo-300 dark:bg-indigo-700'}`} />
                  <div className="h-1 w-1/4 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                </div>
                {/* Content mock */}
                <div className="space-y-2 mt-2">
                  <div className="h-1.5 w-full bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                  <div className="h-1.5 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                  <div className="h-1.5 w-4/6 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                </div>
                
                <div className="flex gap-4 mt-2">
                  <div className="flex-1 space-y-2">
                    <div className="h-1.5 w-1/2 bg-zinc-400 dark:bg-zinc-600 rounded-full opacity-60" />
                    <div className="h-1.5 w-full bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                    <div className="h-1.5 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                  </div>
                  {template.id !== 'minimal' && (
                    <div className="w-1/3 space-y-2">
                      <div className="h-1.5 w-full bg-zinc-400 dark:bg-zinc-600 rounded-full opacity-60" />
                      <div className="h-1.5 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-60" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{template.name}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <Button variant="primary" onClick={onNext} className="gap-2">
          Preview Resume <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
