"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { db } from "@/lib/database";
import { useTestimonials } from "@/lib/database-hooks";
import { type Testimonial } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function TestimonialsManager() {
  const { testimonials, loading } = useTestimonials(); // Use centralized database
  const items = testimonials; // Keep existing variable name for consistency
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    author: "",
    company: "",
    quote: "",
    active: true,
  });

  const handleSave = () => {
    if (!formData.author || !formData.quote)
      return toast({
        title: "Error",
        description: "Fill required fields",
        variant: "destructive",
      });

    if (editing) {
      db.updateTestimonial(editing.id, formData);
      toast({ title: "Testimonial Updated" });
    } else {
      const newTestimonial: Testimonial = {
        id: `testimonial-${Date.now()}`,
        author: formData.author,
        company: formData.company,
        quote: formData.quote,
        active: formData.active,
      };
      db.addTestimonial(newTestimonial);
      toast({ title: "Testimonial Added" });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manage Testimonials</h3>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormData({
              author: "",
              company: "",
              quote: "",
              active: true,
            });
            setIsDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.author}</TableCell>
              <TableCell className="hidden md:table-cell">
                {item.company}
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.active !== false ? "default" : "secondary"}
                >
                  {item.active !== false ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(item);
                    setFormData({
                      author: item.author,
                      company: item.company,
                      quote: item.quote,
                      active: item.active !== false,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete?")) {
                      db.deleteTestimonial(item.id);
                      toast({ title: "Testimonial Deleted" });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Testimonial</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Author Name *</Label>
              <Input
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Quote *</Label>
              <Textarea
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                rows={4}
                placeholder="Enter the testimonial quote..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
