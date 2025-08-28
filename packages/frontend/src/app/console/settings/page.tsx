"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
interface Organization {
    id: string;
    name: string;
    role: string;
}
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AppLayout from "@/components/shared/layout";


export default function SettingsPage() {
    const router = useRouter();
    const { user, organizations, currentOrg, setCurrentOrg, logout } = useAuth();
    const [newOrgName, setNewOrgName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleOrgChange = (orgId: string) => {
        setCurrentOrg(orgId);
        router.refresh();
    };

    const handleCreateOrg = async () => {
        try {
            setIsCreating(true);
            const response = await api.post("/organizations", {
                name: newOrgName,
            });
            const newOrg = response.data;
            setNewOrgName("");
            toast.success("Organization created successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to create organization");
        } finally {
            setIsCreating(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

    return (
        <div className="space-y-3 p-5">
            
            <Card className="rounded-sm shadow-sm">
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                        Manage your account and session
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <Button variant="destructive" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-sm shadow-sm">
                <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>
                        Manage your organizations and switch between them
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Organization</label>
                        <Select
                            value={currentOrg?.id}
                            onValueChange={handleOrgChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org: Organization) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name} ({org.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Create New Organization</label>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Organization name"
                                value={newOrgName}
                                onChange={(e) => setNewOrgName(e.target.value)}
                            />
                            <Button
                                onClick={handleCreateOrg}
                                disabled={!newOrgName || isCreating}
                            >
                                {isCreating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}