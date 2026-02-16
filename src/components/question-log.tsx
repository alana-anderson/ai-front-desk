"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, AlertTriangle, CheckCircle, Wrench, X } from "lucide-react";

type QAPair = {
  id: string;
  question: string;
  answer: string;
  struggle: boolean;
  resolved: string | null;
  userName: string;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  hours: "Hours",
  closures: "Closures",
  sick_policy: "Sick Policy",
  tuition: "Tuition",
  meals: "Meals",
  daily_meal: "Daily Menu",
  snow_day: "Snow Day",
  tours: "Tours",
  late_pickup: "Late Pickup",
  extra_clothes: "Extra Clothes",
  curriculum: "Curriculum",
  contact: "Contact",
  enrollment: "Enrollment",
  attendance: "Attendance",
  upcoming_event: "Events",
  general: "General",
};

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
  value,
  label,
}));

function CategoryCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
        >
          <span className={value ? "text-slate-800" : "text-slate-400"}>
            {value ? categoryLabels[value] || value : "Select category..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categoryOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === option.value ? "opacity-100" : "opacity-0"}`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getStatusInfo(pair: QAPair) {
  if (pair.struggle && !pair.resolved) {
    return {
      badge: <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">Needs Attention</Badge>,
      cardClass: "border-red-200 bg-red-50/40",
    };
  }
  if (pair.resolved === "rectified") {
    return {
      badge: <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 text-xs">Rectified</Badge>,
      cardClass: "border-slate-100",
    };
  }
  return {
    badge: <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-xs">Handled</Badge>,
    cardClass: "border-slate-100",
  };
}

export function QuestionLog({ pairs, orgId }: { pairs: QAPair[]; orgId: string }) {
  const router = useRouter();
  const [rectifyingId, setRectifyingId] = useState<string | null>(null);
  const [rectifyCategory, setRectifyCategory] = useState("");
  const [rectifyQuestion, setRectifyQuestion] = useState("");
  const [rectifyAnswer, setRectifyAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  function startRectify(pair: QAPair) {
    setRectifyingId(pair.id);
    setRectifyCategory("general");
    setRectifyQuestion(pair.question);
    setRectifyAnswer("");
  }

  async function submitRectify(messageId: string) {
    if (!rectifyAnswer.trim()) return;
    setSaving(true);
    await fetch("/api/questions/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId,
        action: "rectify",
        knowledgeEntry: {
          category: rectifyCategory || "general",
          question: rectifyQuestion,
          answer: rectifyAnswer,
        },
      }),
    });
    setSaving(false);
    setRectifyingId(null);
    router.refresh();
  }

  async function handleIgnore(messageId: string) {
    setSaving(true);
    await fetch("/api/questions/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, action: "ignore" }),
    });
    setSaving(false);
    router.refresh();
  }

  if (pairs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 mb-4">
          <CheckCircle className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-400">No parent questions yet. They&apos;ll appear here once parents start chatting.</p>
      </div>
    );
  }

  const needsAttention = pairs.filter((p) => p.struggle && !p.resolved);
  const handled = pairs.filter((p) => !p.struggle || p.resolved);

  return (
    <div className="space-y-6">
      {/* Needs Attention section */}
      {needsAttention.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
              Needs Attention ({needsAttention.length})
            </h3>
          </div>
          <div className="space-y-3">
            {needsAttention.map((pair) => {
              const { badge, cardClass } = getStatusInfo(pair);
              const isRectifying = rectifyingId === pair.id;

              return (
                <Card key={pair.id} className={`p-5 ${cardClass}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{pair.userName}</span>
                      <span className="text-xs text-slate-300">
                        {new Date(pair.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {badge}
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    &ldquo;{pair.question}&rdquo;
                  </p>
                  <p className="text-sm text-slate-500 mb-4 italic">
                    {pair.answer || "(no response yet)"}
                  </p>

                  {isRectifying ? (
                    <div className="space-y-3 pt-3 border-t border-red-100">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                        Add to Knowledge Base
                      </p>
                      <CategoryCombobox value={rectifyCategory} onChange={setRectifyCategory} />
                      <input
                        value={rectifyQuestion}
                        onChange={(e) => setRectifyQuestion(e.target.value)}
                        placeholder="Question"
                        className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Textarea
                        value={rectifyAnswer}
                        onChange={(e) => setRectifyAnswer(e.target.value)}
                        placeholder="Write the correct answer that the AI should give next time..."
                        rows={3}
                        className="text-sm bg-white"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => submitRectify(pair.id)}
                          disabled={saving || !rectifyAnswer.trim()}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          {saving ? "Saving..." : "Save to Knowledge Base"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRectifyingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-3 border-t border-red-100">
                      <Button
                        size="sm"
                        onClick={() => startRectify(pair)}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        <Wrench className="w-3.5 h-3.5 mr-1.5" />
                        Rectify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIgnore(pair.id)}
                        disabled={saving}
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Ignore
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Handled section */}
      {handled.length > 0 && (
        <div>
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Handled ({handled.length})
              </h3>
            </div>
          )}
          <div className="space-y-3">
            {handled.map((pair) => {
              const { badge, cardClass } = getStatusInfo(pair);
              return (
                <Card key={pair.id} className={`p-4 ${cardClass}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400">{pair.userName}</span>
                        <span className="text-xs text-slate-300">
                          {new Date(pair.createdAt).toLocaleString()}
                        </span>
                        {badge}
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        &ldquo;{pair.question}&rdquo;
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-3">{pair.answer}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
