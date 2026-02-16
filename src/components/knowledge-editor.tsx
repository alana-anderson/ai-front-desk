"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

type KnowledgeItem = {
  id: string;
  category: string;
  question: string | null;
  answer: string;
  source: string;
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
          className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-slate-50 transition-colors"
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
                    className={`mr-2 h-4 w-4 ${
                      value === option.value ? "opacity-100" : "opacity-0"
                    }`}
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

export function KnowledgeEditor({
  items: initialItems,
  orgId,
}: {
  items: KnowledgeItem[];
  orgId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  function startEdit(item: KnowledgeItem) {
    setEditing(item.id);
    setEditCategory(item.category);
    setEditQuestion(item.question || "");
    setEditAnswer(item.answer);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch("/api/knowledge", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category: editCategory, question: editQuestion, answer: editAnswer }),
    });
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  async function addNew() {
    if (!newAnswer.trim()) return;
    setSaving(true);
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: orgId,
        category: newCategory || "general",
        question: newQuestion,
        answer: newAnswer,
      }),
    });
    setSaving(false);
    setAdding(false);
    setNewCategory("");
    setNewQuestion("");
    setNewAnswer("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {/* Add new entry — always at top */}
      {adding ? (
        <Card className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/30">
          <div className="space-y-3">
            <CategoryCombobox value={newCategory} onChange={setNewCategory} />
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question (optional)"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer"
              rows={4}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNew} disabled={saving || !newAnswer.trim()}>
                {saving ? "Adding..." : "Add Entry"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          + Add new knowledge entry
        </button>
      )}

      {/* Existing entries */}
      {initialItems.map((item) => (
        <Card key={item.id} className="p-4 border border-slate-100">
          {editing === item.id ? (
            <div className="space-y-3">
              <CategoryCombobox value={editCategory} onChange={setEditCategory} />
              <input
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder="Question (optional)"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(item.id)} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer hover:bg-slate-50/50 -m-4 p-4 rounded-lg transition-colors"
              onClick={() => startEdit(item)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs">
                  {categoryLabels[item.category] || item.category}
                </Badge>
                <span className="text-xs text-slate-300">Click to edit</span>
              </div>
              {item.question && (
                <p className="text-sm font-medium text-slate-700 mb-1">{item.question}</p>
              )}
              <p className="text-sm text-slate-500 line-clamp-2">{item.answer}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
