"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type QAPair = {
  id: string;
  question: string;
  answer: string;
  struggle: boolean;
  userName: string;
  createdAt: string;
};

export function QuestionLog({ pairs }: { pairs: QAPair[] }) {
  if (pairs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 mb-4">
          <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
          </svg>
        </div>
        <p className="text-slate-400">No parent questions yet. They&apos;ll appear here once parents start chatting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pairs.map((pair) => (
        <Card key={pair.id} className="p-4 border border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400">{pair.userName}</span>
                <span className="text-xs text-slate-300">
                  {new Date(pair.createdAt).toLocaleString()}
                </span>
                {pair.struggle && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                    Needs attention
                  </Badge>
                )}
                {!pair.struggle && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-xs">
                    Handled
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                &ldquo;{pair.question}&rdquo;
              </p>
              <p className="text-sm text-slate-500 line-clamp-3">{pair.answer}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
