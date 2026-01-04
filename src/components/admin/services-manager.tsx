"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { db } from "@/lib/database";
import { useServices } from "@/lib/database-hooks";
import { serviceCategories, type Service } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const iconOptions = [
  "Home",
  "Landmark",
  "Layers",
  "Utensils",
  "Sprout",
  "Wrench",
  "Bug",
  "Car",
  "ParkingCircle",
  "Building",
];

export default function ServicesManager() {
  const { services, loading } = useServices(); // Use centralized database with real-time updates
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    icon: "Home",
    googleFormUrl: "",
    imageUrl: "",
    active: true,
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        icon: service.icon,
        googleFormUrl: service.googleFormUrl || "",
        imageUrl: service.image.imageUrl || "",
        active: service.active !== false,
      });
    } else {
      setEditingService(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        icon: "Home",
        googleFormUrl: "",
        imageUrl: "",
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      // Update existing service
      db.updateService(editingService.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        icon: formData.icon,
        googleFormUrl: formData.googleFormUrl,
        active: formData.active,
        image: {
          ...editingService.image,
          imageUrl: formData.imageUrl || editingService.image.imageUrl,
        },
      });
      toast({
        title: "Service Updated",
        description: `${formData.title} has been updated successfully`,
      });
    } else {
      // Create new service
      const newService: Service = {
        id: `service-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        icon: formData.icon,
        googleFormUrl: formData.googleFormUrl,
        active: formData.active,
        image: {
          id: `img-${Date.now()}`,
          description: formData.title,
          imageUrl:
            formData.imageUrl || "https://picsum.photos/seed/service/600/400",
          imageHint: formData.title.toLowerCase(),
        },
      };
      db.addService(newService);
      toast({
        title: "Service Created",
        description: `${formData.title} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      db.deleteService(id);
      toast({
        title: "Service Deleted",
        description: `${title} has been deleted`,
      });
    }
  };

  const toggleActive = (service: Service) => {
    db.updateService(service.id, { active: !(service.active !== false) });
    toast({
      title:
        service.active !== false ? "Service Deactivated" : "Service Activated",
      description: `${service.title} is now ${
        service.active !== false ? "inactive" : "active"
      }`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manage Services</h3>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove services displayed on your website
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Icon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No services found. Click "Add Service" to create one.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {service.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {service.icon}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(service)}
                      >
                        {service.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id, service.title)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below"
                : "Fill in the details to create a new service"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., House Keeping"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the service..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories
                      .filter((c) => c !== "All Services")
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="googleFormUrl">Google Form URL</Label>
              <Input
                id="googleFormUrl"
                value={formData.googleFormUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleFormUrl: e.target.value })
                }
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingService ? "Update" : "Create"} Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
