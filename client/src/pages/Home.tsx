import { useState, useEffect } from "react";
import { BIBLE_BOOKS, TOTAL_WORDS, TOTAL_CHAPTERS } from "../lib/bible-data";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Award, CheckCircle2, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [completedChapters, setCompletedChapters] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('bible-tracker-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTestament, setActiveTestament] = useState<"OT" | "NT">("OT");
  const [activeBook, setActiveBook] = useState<string | null>(null);
  
  const { toast } = useToast();

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

  const getCompletedWords = () => {
    return BIBLE_BOOKS.reduce((total, book) => {
      const completedCount = getBookProgress(book.name);
      // Approximate words per chapter for this book
      const wordsPerChapter = book.words / book.chapters;
      return total + (completedCount * wordsPerChapter);
    }, 0);
  };

  const totalCompletedWords = getCompletedWords();
  const progressPercentage = (totalCompletedWords / TOTAL_WORDS) * 100;

  const currentBookData = activeBook ? BIBLE_BOOKS.find(b => b.name === activeBook) : null;



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
              <h1 className="text-2xl font-serif font-bold text-foreground cursor-pointer" onClick={() => setActiveBook(null)}>Lumina</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span className="hidden sm:inline">{Math.round(totalCompletedWords).toLocaleString()} / {TOTAL_WORDS.toLocaleString()} Words</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Overall Journey (by word count)</span>
              <span className="font-serif font-bold text-primary">{progressPercentage.toFixed(2)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {!activeBook ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Library View */}
            <div className="flex p-1 bg-muted rounded-lg max-w-md mx-auto">
              <button
                onClick={() => setActiveTestament("OT")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTestament === "OT" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Old Testament
              </button>
              <button
                onClick={() => setActiveTestament("NT")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTestament === "NT" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                New Testament
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BIBLE_BOOKS.filter(b => b.testament === activeTestament).map(book => {
                const completed = getBookProgress(book.name);
                const isDone = completed === book.chapters;
                
                return (
                  <button
                    key={book.name}
                    onClick={() => setActiveBook(book.name)}
                    className="flex flex-col p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="font-serif text-lg font-bold group-hover:text-primary transition-colors">
                        {book.name}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {completed}/{book.chapters}
                        </span>
                      )}
                    </div>
                    <Progress value={(completed / book.chapters) * 100} className="h-1.5 w-full bg-muted" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Book Detail View */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => setActiveBook(null)} className="cursor-pointer">Library</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => {
                    setActiveTestament(currentBookData?.testament as "OT"|"NT");
                    setActiveBook(null);
                  }} className="cursor-pointer">
                    {currentBookData?.testament === "OT" ? "Old Testament" : "New Testament"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-serif font-bold text-primary">{currentBookData?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
              <div>
                <h2 className="text-4xl font-serif font-bold text-foreground mb-2">{currentBookData?.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                  <span>{currentBookData?.chapters} Chapters</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 hidden sm:block" />
                  <span>~{currentBookData?.words.toLocaleString()} Words</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 hidden sm:block" />
                  <span className="text-foreground font-medium">{getBookProgress(currentBookData!.name)} Completed</span>
                </div>
              </div>
              
              <Button 
                variant={getBookProgress(currentBookData!.name) === currentBookData?.chapters ? "outline" : "default"}
                onClick={() => {
                  const isAllDone = getBookProgress(currentBookData!.name) === currentBookData?.chapters;
                  const allChapters = Array.from({ length: currentBookData!.chapters }, (_, i) => i + 1);
                  setCompletedChapters(prev => ({
                    ...prev,
                    [currentBookData!.name]: isAllDone ? [] : allChapters
                  }));
                }}
              >
                {getBookProgress(currentBookData!.name) === currentBookData?.chapters ? "Uncheck All" : "Mark All Complete"}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: currentBookData!.chapters }, (_, i) => i + 1).map(chapter => {
                const isChecked = (completedChapters[currentBookData!.name] || []).includes(chapter);
                
                return (
                  <label
                    key={`${currentBookData!.name}-${chapter}`}
                    className={`
                      relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer
                      border-2 transition-all duration-300 transform hover:scale-[1.02]
                      ${isChecked 
                        ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                        : 'border-border bg-card hover:border-primary/50 text-foreground hover:shadow-md'
                      }
                    `}
                  >
                    <Checkbox 
                      checked={isChecked}
                      onCheckedChange={() => toggleChapter(currentBookData!.name, chapter)}
                      className="absolute top-3 right-3 opacity-0" 
                    />
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                      Chapter
                    </span>
                    <span className={`text-4xl font-serif ${isChecked ? 'font-bold' : ''}`}>
                      {chapter}
                    </span>
                    {isChecked && (
                      <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-in zoom-in duration-300 pointer-events-none" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}