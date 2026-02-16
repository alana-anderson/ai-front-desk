"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
};

export function KnowledgeEditor({
  items: initialItems,
  orgId,
}: {
  items: KnowledgeItem[];
  orgId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  function startEdit(item: KnowledgeItem) {
    setEditing(item.id);
    setEditQuestion(item.question || "");
    setEditAnswer(item.answer);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch("/api/knowledge", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, question: editQuestion, answer: editAnswer }),
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
      {initialItems.map((item) => (
        <Card key={item.id} className="p-4 border border-slate-100">
          {editing === item.id ? (
            <div className="space-y-3">
              <Input
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder="Question (optional)"
                className="text-sm"
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

      {adding ? (
        <Card className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/30">
          <div className="space-y-3">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category (e.g. sick_policy, meals)"
              className="text-sm"
            />
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question (optional)"
              className="text-sm"
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
    </div>
  );
}
