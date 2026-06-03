import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Clock, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ARTICLES } from '@/lib/articles';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'basics', label: '📚 Basics' },
  { id: 'hygiene', label: '🧼 Hygiene' },
  { id: 'nutrition', label: '🥗 Nutrition' },
  { id: 'wellness', label: '🧘 Wellness' },
  { id: 'health', label: '🏥 Health' },
];

export default function Learn() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = selectedCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === selectedCategory);

  if (selectedArticle) {
    return (
      <div className="px-5 pt-6 pb-8">
        <Button
          variant="ghost"
          onClick={() => setSelectedArticle(null)}
          className="mb-4 -ml-2 font-heading"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-3">{selectedArticle.emoji}</div>
          <h1 className="font-heading text-2xl font-bold mb-2">{selectedArticle.title}</h1>
          <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{selectedArticle.readTime} read</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {selectedArticle.category}
            </Badge>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown className="text-foreground leading-relaxed text-sm space-y-3 [&_strong]:text-foreground [&_strong]:font-bold">
              {selectedArticle.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Learn</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Understand your body with easy-to-read articles 💕
      </p>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="rounded-full text-xs whitespace-nowrap font-heading shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {filteredArticles.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{article.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-sm leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}