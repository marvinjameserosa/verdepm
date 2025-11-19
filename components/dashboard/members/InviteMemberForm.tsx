"use client";

import { useState } from "react";
import { useInviteMember } from "@/hooks/useInviteMember";
import { inviteMemberSchema } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InviteMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string[];
    password?: string[];
    firstname?: string[];
    lastname?: string[];
    phone?: string[];
    role?: string[];
  }>({});

  const { inviteMember, loading, error, data } = useInviteMember();
  const successMessage =
    data && typeof data === "object" && "message" in data
      ? (data as { message?: string }).message ?? null
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate with Zod
    const validationResult = inviteMemberSchema.safeParse({
      email,
      password,
      firstname,
      lastname,
      phone,
      role,
    });

    if (!validationResult.success) {
      setValidationErrors(validationResult.error.flatten().fieldErrors);
      return;
    }

    const inviteResult = await inviteMember(
      email,
      password,
      firstname,
      lastname,
      phone,
      role
    );

    if (inviteResult && !error) {
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
      setPhone("");
      setRole("");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
          Create User
        </h3>
        <p className="text-sm text-muted-foreground">
          Send an invitation with temporary credentials the member can update
          later.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstname">First Name</Label>
          <Input
            id="firstname"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="John"
            className={validationErrors.firstname ? "border-red-500" : ""}
          />
          {validationErrors.firstname && (
            <p className="text-xs text-red-600 mt-1">
              {validationErrors.firstname[0]}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input
            id="lastname"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Doe"
            className={validationErrors.lastname ? "border-red-500" : ""}
          />
          {validationErrors.lastname && (
            <p className="text-xs text-red-600 mt-1">
              {validationErrors.lastname[0]}
            </p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new.member@example.com"
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p className="text-xs text-red-600 mt-1">
            {validationErrors.email[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className={`pr-10 ${
              validationErrors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-xs text-red-600 mt-1">
            {validationErrors.password[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          className={validationErrors.phone ? "border-red-500" : ""}
        />
        {validationErrors.phone && (
          <p className="text-xs text-red-600 mt-1">
            {validationErrors.phone[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={setRole} value={role}>
          <SelectTrigger
            className={validationErrors.role ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="z-100">
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.role && (
          <p className="text-xs text-red-600 mt-1">
            {validationErrors.role[0]}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
      >
        {loading ? "Creating User..." : "Create User"}
      </Button>
      {successMessage && (
        <p className="text-sm text-emerald-600 dark:text-emerald-300">
          {successMessage}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
