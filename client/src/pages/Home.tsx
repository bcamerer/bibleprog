import { useState, useEffect } from "react";
import { BIBLE_BOOKS, TOTAL_CHAPTERS } from "../lib/bible-data";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Award, CheckCircle2 } from "lucide-react";

export default function Home() {
  // Use localStorage to persist state for the mockup
  const [completedChapters, setCompletedChapters] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('bible-tracker-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTestament, setActiveTestament] = useState<"OT" | "NT">("OT");
  const [activeBook, setActiveBook] = useState<string>("Genesis");

  useEffect(() => {
    localStorage.setItem('bible-tracker-progress', JSON.stringify(completedChapters));
  }, [completedChapters]);

  const toggleChapter = (bookName: string, chapter: number) => {
    setCompletedChapters(prev => {
      const bookProgress = prev[bookName] || [];
      const newProgress = bookProgress.includes(chapter)
        ? bookProgress.filter(c => c !== chapter)
        : [...bookProgress, chapter];
      
      return {
        ...prev,
        [bookName]: newProgress
      };
    });
  };

  const getBookProgress = (bookName: string) => {
    return (completedChapters[bookName] || []).length;
  };

  const getTotalCompleted = () => {
    return Object.values(completedChapters).reduce((acc, curr) => acc + curr.length, 0);
  };

  const totalCompleted = getTotalCompleted();
  const progressPercentage = (totalCompleted / TOTAL_CHAPTERS) * 100;

  const currentBookData = BIBLE_BOOKS.find(b => b.name === activeBook) || BIBLE_BOOKS[0];

  return (
    <div className="min-h-screen pb-20">
      {/* Header & Overall Progress */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Lumina</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Award className="w-4 h-4 text-primary" />
              <span>{totalCompleted} / {TOTAL_CHAPTERS} Chapters</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Overall Journey</span>
              <span className="font-serif font-bold text-primary">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        
        {/* Sidebar - Book Navigation */}
        <div className="space-y-6">
          {/* Testament Toggle */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => { setActiveTestament("OT"); setActiveBook("Genesis"); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTestament === "OT" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Old Testament
            </button>
            <button
              onClick={() => { setActiveTestament("NT"); setActiveBook("Matthew"); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTestament === "NT" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New Testament
            </button>
          </div>

          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-3 flex flex-col gap-1">
                {BIBLE_BOOKS.filter(b => b.testament === activeTestament).map(book => {
                  const completed = getBookProgress(book.name);
                  const isDone = completed === book.chapters;
                  const isActive = activeBook === book.name;
                  
                  return (
                    <button
                      key={book.name}
                      onClick={() => setActiveBook(book.name)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className={`font-serif ${isActive ? 'font-bold' : ''}`}>
                        {book.name}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                      ) : (
                        <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {completed}/{book.chapters}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Content - Chapter Checklist */}
        <div>
          <div className="mb-8">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-2">{currentBookData.name}</h2>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{currentBookData.chapters} Chapters</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <span>{getBookProgress(currentBookData.name)} Completed</span>
            </div>
            
            <Progress 
              value={(getBookProgress(currentBookData.name) / currentBookData.chapters) * 100} 
              className="h-1 mt-6"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: currentBookData.chapters }, (_, i) => i + 1).map(chapter => {
              const isChecked = (completedChapters[currentBookData.name] || []).includes(chapter);
              
              return (
                <label
                  key={`${currentBookData.name}-${chapter}`}
                  className={`
                    relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${isChecked 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                      : 'border-border bg-card hover:border-primary/50 text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={() => toggleChapter(currentBookData.name, chapter)}
                    className="absolute top-2 right-2 opacity-0" 
                    // Hide the actual checkbox, we use the whole card as the hit target
                  />
                  <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-1">
                    Chapter
                  </span>
                  <span className={`text-3xl font-serif ${isChecked ? 'font-bold' : ''}`}>
                    {chapter}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}