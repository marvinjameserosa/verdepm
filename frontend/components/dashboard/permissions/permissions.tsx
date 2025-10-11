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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  Crown,
  Users,
  Eye,
  Edit,
  Settings,
  Lock,
  CheckCircle,
  Info,
  Building,
  FileText,
  BarChart3,
  Database,
  UserCheck,
} from "lucide-react";
import { Background } from "@/components/ui/background";

// Permission categories and individual permissions
const permissionCategories = {
  projects: {
    name: "Project Management",
    icon: Building,
    permissions: [
      {
        id: "project_view",
        name: "View Projects",
        description: "View project details and status",
      },
      {
        id: "project_create",
        name: "Create Projects",
        description: "Create new projects",
      },
      {
        id: "project_edit",
        name: "Edit Projects",
        description: "Modify project settings and data",
      },
      {
        id: "project_delete",
        name: "Delete Projects",
        description: "Remove projects from system",
      },
      {
        id: "project_assign",
        name: "Assign Team Members",
        description: "Add/remove team members from projects",
      },
    ],
  },
  esg: {
    name: "ESG & Analytics",
    icon: BarChart3,
    permissions: [
      {
        id: "esg_view",
        name: "View ESG Data",
        description: "Access environmental, social, governance metrics",
      },
      {
        id: "esg_edit",
        name: "Edit ESG Data",
        description: "Modify ESG metrics and assessments",
      },
      {
        id: "analytics_dashboard",
        name: "Analytics Dashboard",
        description: "Access advanced analytics and insights",
      },
      {
        id: "carbon_calculator",
        name: "Carbon Calculator",
        description: "Use carbon footprint calculation tools",
      },
      {
        id: "compliance_tracking",
        name: "Compliance Tracking",
        description: "Monitor regulatory compliance status",
      },
    ],
  },
  reports: {
    name: "Reports & Documentation",
    icon: FileText,
    permissions: [
      {
        id: "reports_view",
        name: "View Reports",
        description: "Access generated reports and documentation",
      },
      {
        id: "reports_create",
        name: "Generate Reports",
        description: "Create custom reports from data",
      },
      {
        id: "reports_export",
        name: "Export Reports",
        description: "Download reports in various formats",
      },
      {
        id: "documentation_manage",
        name: "Manage Documentation",
        description: "Upload and organize project documents",
      },
    ],
  },
  admin: {
    name: "System Administration",
    icon: Settings,
    permissions: [
      {
        id: "user_management",
        name: "User Management",
        description: "Invite, edit, and remove team members",
      },
      {
        id: "role_management",
        name: "Role Management",
        description: "Create and modify user roles",
      },
      {
        id: "system_settings",
        name: "System Settings",
        description: "Configure system-wide settings",
      },
      {
        id: "billing_management",
        name: "Billing Management",
        description: "Manage subscription and billing",
      },
      {
        id: "audit_logs",
        name: "Audit Logs",
        description: "View system activity and security logs",
      },
    ],
  },
};

// Predefined roles with permissions
const systemRoles = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full system access with all permissions",
    color: "purple",
    icon: Crown,
    permissions: Object.values(permissionCategories).flatMap((cat) =>
      cat.permissions.map((p) => p.id)
    ),
    memberCount: 2,
  },
  {
    id: "project_manager",
    name: "Project Manager",
    description: "Project oversight and team coordination",
    color: "blue",
    icon: Building,
    permissions: [
      "project_view",
      "project_create",
      "project_edit",
      "project_assign",
      "esg_view",
      "esg_edit",
      "analytics_dashboard",
      "compliance_tracking",
      "reports_view",
      "reports_create",
      "reports_export",
      "documentation_manage",
    ],
    memberCount: 4,
  },
  {
    id: "esg_analyst",
    name: "ESG Analyst",
    description: "Environmental, social, governance data analysis",
    color: "emerald",
    icon: BarChart3,
    permissions: [
      "project_view",
      "esg_view",
      "esg_edit",
      "analytics_dashboard",
      "carbon_calculator",
      "compliance_tracking",
      "reports_view",
      "reports_create",
    ],
    memberCount: 3,
  },
  {
    id: "compliance_officer",
    name: "Compliance Officer",
    description: "Regulatory compliance and risk management",
    color: "amber",
    icon: Shield,
    permissions: [
      "project_view",
      "esg_view",
      "compliance_tracking",
      "reports_view",
      "reports_create",
      "documentation_manage",
    ],
    memberCount: 2,
  },
  {
    id: "contractor",
    name: "Contractor",
    description: "External partner with limited project access",
    color: "gray",
    icon: UserCheck,
    permissions: ["project_view", "esg_view", "reports_view"],
    memberCount: 5,
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to assigned projects",
    color: "slate",
    icon: Eye,
    permissions: ["project_view", "reports_view"],
    memberCount: 8,
  },
];

// Security settings by tier
const securityFeatures = {
  starter: {
    name: "Starter",
    features: ["Basic Role Management", "Standard Permissions"],
    advanced: false,
  },
  professional: {
    name: "Professional",
    features: ["Custom Roles", "Project-Level Permissions", "Audit Logs"],
    advanced: false,
  },
  enterprise: {
    name: "Enterprise",
    features: [
      "Advanced Security",
      "SSO Integration",
      "IP Restrictions",
      "2FA Enforcement",
    ],
    advanced: true,
  },
};

export default function PermissionsTab() {
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [currentTier] = useState("enterprise"); // This would come from subscription data

  const currentSecurity =
    securityFeatures[currentTier as keyof typeof securityFeatures];

  const getPermissionStatus = (roleId: string, permissionId: string) => {
    const role = systemRoles.find((r) => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  };

  return (
    <Background variant="subtle" className="min-h-screen">
      <div className="relative z-10 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Permissions & Access Control
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage roles, permissions, and security settings across your
                  organization
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Security Level
                  </CardTitle>
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-emerald-600 mb-1">
                  {currentSecurity.name}
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                  {currentSecurity.advanced ? "Advanced" : "Standard"} Features
                </Badge>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Active Roles
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {systemRoles.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  System-wide role definitions
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {systemRoles.reduce((sum, role) => sum + role.memberCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Across all roles and projects
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
              <TabsTrigger
                value="roles"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Permission Matrix
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </TabsTrigger>
            </TabsList>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">System Roles</h3>
                  <p className="text-sm text-muted-foreground">
                    Predefined roles with specific permission sets
                  </p>
                </div>
                <Dialog
                  open={isCreateRoleDialogOpen}
                  onOpenChange={setIsCreateRoleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <Crown className="h-4 w-4 mr-2" />
                      Create Custom Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Custom Role</DialogTitle>
                      <DialogDescription>
                        Define a new role with specific permissions for your
                        organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Senior Analyst"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          placeholder="Describe the role responsibilities..."
                          className="w-full p-2 border rounded-lg h-20 resize-none"
                        />
                      </div>
                      {Object.entries(permissionCategories).map(
                        ([key, category]) => {
                          const IconComponent = category.icon;
                          return (
                            <div key={key} className="space-y-3">
                              <div className="flex items-center gap-2 font-medium">
                                <IconComponent className="h-4 w-4" />
                                {category.name}
                              </div>
                              <div className="space-y-2 ml-6">
                                {category.permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="text-sm font-medium">
                                        {permission.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </div>
                                    </div>
                                    <Switch />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateRoleDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        Create Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemRoles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <Card
                      key={role.id}
                      className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                      onClick={() =>
                        setSelectedRole(
                          role.id === selectedRole ? null : role.id
                        )
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg bg-${role.color}-100 dark:bg-${role.color}-900/40`}
                            >
                              <IconComponent
                                className={`h-4 w-4 text-${role.color}-600 dark:text-${role.color}-400`}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {role.name}
                              </CardTitle>
                              <Badge
                                className={`bg-${role.color}-100 text-${role.color}-800 text-xs`}
                              >
                                {role.memberCount} members
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {role.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions.length} permissions assigned
                        </div>

                        {selectedRole === role.id && (
                          <div className="mt-4 pt-4 border-t border-border space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">
                              KEY PERMISSIONS:
                            </div>
                            <div className="space-y-1">
                              {role.permissions.slice(0, 3).map((permId) => {
                                const permission = Object.values(
                                  permissionCategories
                                )
                                  .flatMap((cat) => cat.permissions)
                                  .find((p) => p.id === permId);
                                return permission ? (
                                  <div
                                    key={permId}
                                    className="text-xs flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    {permission.name}
                                  </div>
                                ) : null;
                              })}
                              {role.permissions.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{role.permissions.length - 3} more
                                  permissions
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                Members
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Permission Matrix Tab */}
            <TabsContent value="permissions" className="space-y-6 mt-6">
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-emerald-700 dark:text-emerald-300">
                    Permission Matrix
                  </CardTitle>
                  <CardDescription>
                    Overview of all permissions across system roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Header */}
                      <div className="grid grid-cols-7 gap-2 mb-4 font-medium text-sm">
                        <div className="p-3">Permission</div>
                        {systemRoles.slice(0, 6).map((role) => (
                          <div key={role.id} className="p-3 text-center">
                            {role.name.split(" ")[0]}
                          </div>
                        ))}
                      </div>

                      {/* Permission rows grouped by category */}
                      {Object.entries(permissionCategories).map(
                        ([categoryKey, category]) => (
                          <div key={categoryKey} className="mb-6">
                            <div className="flex items-center gap-2 mb-3 font-medium text-emerald-700 dark:text-emerald-300">
                              <category.icon className="h-4 w-4" />
                              {category.name}
                            </div>
                            {category.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="grid grid-cols-7 gap-2 items-center py-2 border-b border-border/50"
                              >
                                <div className="p-2">
                                  <div className="font-medium text-sm">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </div>
                                </div>
                                {systemRoles.slice(0, 6).map((role) => (
                                  <div
                                    key={role.id}
                                    className="flex justify-center p-2"
                                  >
                                    {getPermissionStatus(
                                      role.id,
                                      permission.id
                                    ) ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-emerald-700 dark:text-emerald-300">
                    Security Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure advanced security settings for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan Features */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Available Security Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentSecurity.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentSecurity.advanced && (
                    <>
                      {/* Advanced Security Settings */}
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          Advanced Security Settings
                        </h4>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <div className="font-medium">
                                Two-Factor Authentication
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Require 2FA for all users
                              </div>
                            </div>
                            <Switch />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <div className="font-medium">
                                IP Address Restrictions
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Limit access to specific IP ranges
                              </div>
                            </div>
                            <Switch />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <div className="font-medium">Session Timeout</div>
                              <div className="text-sm text-muted-foreground">
                                Automatic logout after inactivity
                              </div>
                            </div>
                            <Select defaultValue="8hours">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1hour">1 Hour</SelectItem>
                                <SelectItem value="4hours">4 Hours</SelectItem>
                                <SelectItem value="8hours">8 Hours</SelectItem>
                                <SelectItem value="24hours">
                                  24 Hours
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                              <div className="font-medium">Data Encryption</div>
                              <div className="text-sm text-muted-foreground">
                                End-to-end encryption for sensitive data
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800">
                              <Lock className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Audit & Compliance */}
                      <div>
                        <h4 className="font-medium mb-3">Audit & Compliance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Audit Logs</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Track all user actions and system changes
                            </div>
                            <Button size="sm" variant="outline">
                              View Logs
                            </Button>
                          </div>

                          <div className="p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">
                                Compliance Reports
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Generate security compliance documentation
                            </div>
                            <Button size="sm" variant="outline">
                              Generate Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!currentSecurity.advanced && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-700 dark:text-blue-300">
                            Upgrade for Advanced Security
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            Get access to 2FA, IP restrictions, SSO integration,
                            and advanced audit logs.
                          </div>
                        </div>
                      </div>
                      <Button className="mt-3" variant="outline">
                        Upgrade to Enterprise
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Background>
  );
}
