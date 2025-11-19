"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_OPTIONS, type User } from "@/types/user";
import { supabase } from "@/utils/supabase/client";

interface EditMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null;
  onUpdate: (updatedMember: User) => void;
  availableRoles?: User["role"][];
}

export const EditMemberDialog = ({
  isOpen,
  onClose,
  member,
  onUpdate,
  availableRoles,
}: EditMemberDialogProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const roleOptions = ["owner", "manager", "member"];

  useEffect(() => {
    if (member) {
      setFormData({
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        phone: member.phone,
        role: member.role,
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as User["role"] }));
  };

  const handleSubmit = () => {
    if (!member) return;

    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== undefined)
    ) as Partial<User>;

    onUpdate({
      ...member,
      ...cleanedFormData,
      role: (cleanedFormData.role ?? member.role) as User["role"],
    });
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the details for {member.first_name} {member.last_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role ?? member?.role ?? undefined}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="z-100">
                {roleOptions.map((roleName) => (
                  <SelectItem key={roleName} value={roleName}>
                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
