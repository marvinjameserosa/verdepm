"use client";

import { useState } from "react";
import { useInviteMember } from "@/lib/hooks/useInviteMember";
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

export function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState("");
  const { inviteMember, loading, error, data } = useInviteMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteMember(email, password, phone, firstname, lastname, role);
    if (!error) {
      setEmail(""); // Clear input on success
      setPassword(""); // Clear input on success
      setPhone(""); // Clear input on success
      setFirstname(""); // Clear input on success
      setLastname(""); // Clear input on success
      setRole(""); // Clear input on success
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg bg-background"
    >
      <h3 className="text-lg font-semibold">Create User</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstname" className="block text-sm font-medium">
            First Name
          </Label>
          <Input
            type="text"
            id="firstname"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastname" className="block text-sm font-medium">
            Last Name
          </Label>
          <Input
            type="text"
            id="lastname"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
            placeholder="Doe"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email" className="block text-sm font-medium">
          Email address
        </Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="new.member@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password" className="block text-sm font-medium">
          Password
        </Label>
        <Input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
        />
      </div>
      <div>
        <Label htmlFor="phone" className="block text-sm font-medium">
          Phone Number
        </Label>
        <Input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div>
        <Label htmlFor="role" className="block text-sm font-medium">
          Role
        </Label>
        <Select onValueChange={setRole} value={role}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="z-100">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="project_manager">Project Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating User..." : "Create User"}
      </Button>
      {data && <p className="text-sm text-green-600">{data.message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
