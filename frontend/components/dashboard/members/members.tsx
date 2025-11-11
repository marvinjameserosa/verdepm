"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Globe,
} from "lucide-react";
import { Background } from "@/components/ui/background";
import { InviteMemberForm } from "./InviteMemberForm";

// Subscription tiers with limits
const subscriptionTiers = {
  starter: { name: "Starter", maxMembers: 5, color: "gray" },
  professional: { name: "Professional", maxMembers: 25, color: "blue" },
  enterprise: { name: "Enterprise", maxMembers: 100, color: "emerald" },
  unlimited: { name: "Enterprise Plus", maxMembers: -1, color: "purple" },
};

// Sample data for members
const membersData = [
  {
    id: 1,
    name: "John Anderson",
    email: "john.anderson@verdepm.com",
    role: "Administrator",
    department: "Management",
    status: "Active",
    joinDate: "2024-01-15",
    lastActive: "2024-10-12",
    projects: ["Verde Tower", "Crimson Bridge"],
    avatar: "JA",
    phone: "+1 (555) 123-4567",
    permissions: ["All Access"],
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@verdepm.com",
    role: "Project Manager",
    department: "Construction",
    status: "Active",
    joinDate: "2024-02-20",
    lastActive: "2024-10-12",
    projects: ["Azure Shopping Mall", "Solaris Industrial Park"],
    avatar: "SC",
    phone: "+1 (555) 234-5678",
    permissions: ["Project Management", "Reporting"],
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    email: "m.rodriguez@verdepm.com",
    role: "ESG Analyst",
    department: "Sustainability",
    status: "Active",
    joinDate: "2024-03-10",
    lastActive: "2024-10-11",
    projects: ["Verde Tower", "Aqua-front Residences"],
    avatar: "MR",
    phone: "+1 (555) 345-6789",
    permissions: ["ESG Analytics", "Reporting"],
  },
  {
    id: 4,
    name: "Emma Thompson",
    email: "emma.thompson@verdepm.com",
    role: "Compliance Officer",
    department: "Legal & Compliance",
    status: "Active",
    joinDate: "2024-04-05",
    lastActive: "2024-10-10",
    projects: ["Crimson Bridge", "Ember Hotel"],
    avatar: "ET",
    phone: "+1 (555) 456-7890",
    permissions: ["Compliance Management", "Documentation"],
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@contractor.com",
    role: "Contractor",
    department: "External",
    status: "Pending",
    joinDate: "2024-10-01",
    lastActive: "2024-10-08",
    projects: ["Verde Tower"],
    avatar: "DK",
    phone: "+1 (555) 567-8901",
    permissions: ["Project View"],
  },
];

const MembersTab = () => {
  const [currentTier, setCurrentTier] = useState(
    subscriptionTiers.professional
  );
  const [members, setMembers] = useState(membersData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Administrator":
        return <Crown className="h-4 w-4 text-purple-500" />;
      case "Project Manager":
        return <Building className="h-4 w-4 text-blue-500" />;
      case "ESG Analyst":
        return <Globe className="h-4 w-4 text-emerald-500" />;
      case "Compliance Officer":
        return <Shield className="h-4 w-4 text-amber-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
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
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Invite a new member</DialogTitle>
                <DialogDescription>
                  Enter the email of the person you want to invite. They will
                  receive an email with instructions to join your organization.
                </DialogDescription>
              </DialogHeader>
              <InviteMemberForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subscription & Member Limit Section */}
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge
              className={`bg-${currentTier.color}-100 text-${currentTier.color}-800`}
            >
              {currentTier.name}
            </Badge>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTier.maxMembers === -1
              ? "Unlimited members"
              : `${members.length}/${currentTier.maxMembers} members used`}
          </div>
          {currentTier.maxMembers !== -1 && (
            <Progress
              value={(members.length / currentTier.maxMembers) * 100}
              className="h-2 mt-2"
            />
          )}
        </CardContent>
      </Card>

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
          <CardTitle className="text-emerald-700 dark:text-emerald-300">
            Team Directory
          </CardTitle>
          <CardDescription>
            {filteredMembers.length} of {membersData.length} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {member.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        {getRoleIcon(member.role)}
                        <Badge
                          variant="outline"
                          className={getStatusBadge(member.status)}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.email} • {member.department}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {member.joinDate}
                        </span>
                        <span>Projects: {member.projects.join(", ")}</span>
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default MembersTab;
