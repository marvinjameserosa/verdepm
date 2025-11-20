"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Trash2,
  Calendar,
  Search,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import { InviteMemberForm } from "./InviteMemberForm";
import { USER_ROLE_OPTIONS, type User } from "@/types/user";
import { EditMemberDialog } from "./EditMemberDialog";
import { ConfirmationDialog } from "./ConfirmationDialog";
import Image from "next/image";
import { useMembers } from "@/hooks/useMembers";

const isValidUrl = (value?: string | null) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const buildAvatarUrl = (member: User) => {
  const displayName = `${member.first_name ?? ""} ${member.last_name ?? ""}`
    .trim()
    .replace(/\s+/g, " ");
  const seed = displayName || member.email || "Verde Member";
  const candidate = [member.avatar_url, member.avatar].find((value) =>
    isValidUrl(value)
  );

  if (candidate) {
    return candidate;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seed
  )}&background=0D8ABC&color=ffffff&size=128`;
};

const MembersTab = () => {
  const { members, setMembers, refreshMembers } = useMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [deletingMember, setDeletingMember] = useState<User | null>(null);
  const handleMemberInvited = useCallback(async () => {
    await refreshMembers();
  }, [refreshMembers]);
  const availableRoles = useMemo(() => {
    const unique = new Set<User["role"]>();
    members.forEach((member) => {
      if (member.role) {
        unique.add(member.role);
      }
    });
    return unique.size ? Array.from(unique) : USER_ROLE_OPTIONS;
  }, [members]);

  const handleUpdateMember = async (updatedMember: User) => {
    try {
      const response = await fetch("/api/admin/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: updatedMember.user_id,
          email: updatedMember.email,
          firstname: updatedMember.first_name,
          lastname: updatedMember.last_name,
          phone: updatedMember.phone,
          role: updatedMember.role,
          avatarUrl: updatedMember.avatar_url ?? null,
          avatarStoragePath: updatedMember.avatar_storage_path ?? null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = payload?.error ?? "Failed to update member.";
        throw new Error(errorMessage);
      }

      const updatedUser = (payload?.user as User) ?? updatedMember;

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.user_id === updatedMember.user_id
            ? { ...member, ...updatedMember, ...updatedUser }
            : member
        )
      );
    } catch (error) {
      console.error("Error updating member:", error);
    } finally {
      setEditingMember(null);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: deletingMember.user_id }),
    });

    if (response.ok) {
      setMembers((prevMembers) =>
        prevMembers.filter(
          (member) => member.user_id !== deletingMember.user_id
        )
      );
    } else {
      const error = await response.text();
      console.error("Error deleting member:", error);
    }
    setDeletingMember(null);
  };

  const filteredMembers = members.filter((member) =>
    `${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "Pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-xl overflow-hidden rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 shadow-2xl backdrop-blur p-0">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Invite a new member
                </DialogTitle>
                <DialogDescription>
                  Enter the email of the person you want to invite. They will
                  receive an email with instructions to join your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6">
                <InviteMemberForm onSuccess={handleMemberInvited} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-300"></CardTitle>
          <CardDescription>
            {filteredMembers.length} of {members.length} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const displayName = `${member.first_name ?? ""} ${
                member.last_name ?? ""
              }`
                .trim()
                .replace(/\s+/g, " ");
              const avatarSrc = buildAvatarUrl(member);

              return (
                <div
                  key={member.user_id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-emerald-100/70 dark:border-emerald-900/40 bg-white shadow-sm flex-shrink-0">
                        <Image
                          src={avatarSrc}
                          alt={displayName || member.email || "Team member"}
                          fill
                          sizes="48px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {displayName || member.email}
                          </h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                          {member.department ? ` • ${member.department}` : ""}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {member.joinDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {member.joinDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeletingMember(member)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No members found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search filters or invite new members to get
                started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditMemberDialog
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onUpdate={handleUpdateMember}
        availableRoles={availableRoles}
      />
      <ConfirmationDialog
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
        title="Are you sure?"
        description={`This will permanently remove ${
          deletingMember?.first_name
        } ${deletingMember?.last_name ?? ""} from the organization.`}
      />
    </div>
  );
};

export default MembersTab;
