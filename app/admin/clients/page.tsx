"use client";

import * as React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Percent,
  Mail,
  UserCheck,
} from "lucide-react";

interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  tier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  membersCount: number;
  activeOrdersCount: number;
  totalSpent: number;
  customDiscountPercent: number;
  billingEmail: string;
}

interface ClientUserRecord {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  tier: string;
  role: string;
  totalOrders: number;
  totalSpend: number;
  lastActive: string;
}

export default function AdminClientsPage() {
  const [organizations, setOrganizations] = React.useState<OrganizationRecord[]>([]);
  const [clients, setClients] = React.useState<ClientUserRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"orgs" | "users">("orgs");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // New Org Form
  const [newOrgName, setNewOrgName] = React.useState("");
  const [newOrgEmail, setNewOrgEmail] = React.useState("");
  const [newOrgTier, setNewOrgTier] = React.useState<"STARTER" | "PROFESSIONAL" | "ENTERPRISE">("ENTERPRISE");
  const [newOrgDiscount, setNewOrgDiscount] = React.useState(15);

  const fetchClientData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      if (data.organizations) setOrganizations(data.organizations);
      if (data.clients) setClients(data.clients);
    } catch (err) {
      console.error("Failed to load client data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgEmail) return;

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createOrg",
          organization: {
            name: newOrgName,
            slug: newOrgName.toLowerCase().replace(/\s+/g, "-"),
            tier: newOrgTier,
            customDiscountPercent: newOrgDiscount,
            billingEmail: newOrgEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) => [...prev, data.organization]);
        setIsModalOpen(false);
        setFeedback(`Enterprise account "${newOrgName}" successfully registered.`);
        setTimeout(() => setFeedback(null), 4000);
        setNewOrgName("");
        setNewOrgEmail("");
      }
    } catch (err) {
      console.error("Failed to create org", err);
    }
  };

  const handleUpdateDiscount = async (id: string, currentDiscount: number) => {
    const nextDiscount = currentDiscount >= 20 ? 10 : currentDiscount + 5;
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateOrg",
          id,
          updates: { customDiscountPercent: nextDiscount },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, customDiscountPercent: nextDiscount } : o
          )
        );
        setFeedback(`Updated preferred discount rate to ${nextDiscount}%.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update discount", err);
    }
  };

  const filteredOrgs = organizations.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.billingEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "ALL" || o.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalOrgSpend = organizations.reduce((sum, o) => sum + o.totalSpent, 0);

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Accounts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Client & Enterprise Organization Directory
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage law firm retainers, corporate billing rules, volume discounts, and client impersonation workspaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchClientData}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Corporate Accounts
              </span>
              <Building2 className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {organizations.length} Organizations
            </p>
            <p className="text-xs text-text-muted mt-1">Law firms, clinics, & agencies</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Registered Client Users
              </span>
              <Users className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {clients.length} Requesters
            </p>
            <p className="text-xs text-text-muted mt-1">Authorized corporate signers</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Institutional Spend
              </span>
              <DollarSign className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              ${totalOrgSpend.toFixed(2)}
            </p>
            <p className="text-xs text-text-muted mt-1">Gross billed under contracts</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Active Legal Retainers
              </span>
              <ShieldCheck className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {organizations.filter((o) => o.tier === "ENTERPRISE").length} Accounts
            </p>
            <p className="text-xs text-text-muted mt-1">Net-30 invoiced monthly</p>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("orgs")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "orgs"
                ? "border-brand-500 text-brand-ink font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Corporate Organizations ({organizations.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-brand-500 text-brand-ink font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Individual Client Users ({clients.length})
          </button>
        </div>

        {/* Tab 1: Organizations */}
        {activeTab === "orgs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organization or billing email..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-medium">Tier:</span>
                {["ALL", "ENTERPRISE", "PROFESSIONAL", "STARTER"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                      tierFilter === tier
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-surface border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <Card className="border-border bg-surface shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-raised border-b border-border text-text-muted uppercase tracking-wider font-semibold">
                      <th className="p-3">Organization Name</th>
                      <th className="p-3">Contract Tier</th>
                      <th className="p-3">Members</th>
                      <th className="p-3">Active Jobs</th>
                      <th className="p-3">Total Spend</th>
                      <th className="p-3">Volume Discount</th>
                      <th className="p-3">Billing Email</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-surface-raised/60 transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-text text-sm">{org.name}</p>
                          <span className="font-mono text-[11px] text-text-muted">
                            slug: {org.slug}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              org.tier === "ENTERPRISE"
                                ? "bg-brand-500/10 text-brand-ink"
                                : org.tier === "PROFESSIONAL"
                                ? "bg-status-info/10 text-status-info"
                                : "bg-surface-raised text-text-muted border border-border"
                            }`}
                          >
                            {org.tier}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-text">
                          {org.membersCount} Seats
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-text">
                            {org.activeOrdersCount}
                          </span>
                          <span className="text-text-muted ml-1">in progress</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-text">
                          ${org.totalSpent.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleUpdateDiscount(org.id, org.customDiscountPercent)
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised border border-border hover:border-brand-500 text-brand-ink font-semibold"
                            title="Click to cycle discount tier"
                          >
                            <Percent className="w-3 h-3" />
                            <span>{org.customDiscountPercent}% Off</span>
                          </button>
                        </td>
                        <td className="p-3 text-text-muted font-mono text-[11px]">
                          {org.billingEmail}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href="/dashboard" target="_blank">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-border text-text hover:bg-surface-raised"
                                title="Open client dashboard workspace"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View As
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Individual Client Users */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, email, or firm..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <Card className="border-border bg-surface shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-raised border-b border-border text-text-muted uppercase tracking-wider font-semibold">
                      <th className="p-3">Client User</th>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Orders Placed</th>
                      <th className="p-3">Lifetime Spend</th>
                      <th className="p-3">Last Submission</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredClients.map((client) => (
                      <tr key={client.email} className="hover:bg-surface-raised/60 transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-text">{client.name}</p>
                          <p className="text-[11px] text-text-muted">{client.email}</p>
                        </td>
                        <td className="p-3 font-medium text-text">
                          {client.organizationName}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {client.role}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium text-text">
                          {client.totalOrders} Orders
                        </td>
                        <td className="p-3 font-mono font-bold text-text">
                          ${client.totalSpend.toFixed(2)}
                        </td>
                        <td className="p-3 text-text-muted text-[11px]">
                          {new Date(client.lastActive).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <Link href="/dashboard" target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-border text-text hover:bg-surface-raised"
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Impersonate
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modal: Add Organization */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 border-border bg-surface shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-text">Register Enterprise Organization</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-text text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-3">
                <div>
                  <Label className="text-xs">Organization / Law Firm Name</Label>
                  <Input
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Cambridge Immigration Advisors"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Central Billing Email</Label>
                  <Input
                    required
                    type="email"
                    value={newOrgEmail}
                    onChange={(e) => setNewOrgEmail(e.target.value)}
                    placeholder="e.g. invoices@cambridge-advisors.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Contract Tier</Label>
                    <select
                      value={newOrgTier}
                      onChange={(e) => setNewOrgTier(e.target.value as any)}
                      className="w-full h-9 rounded-md border border-border bg-surface text-text text-sm px-3"
                    >
                      <option value="ENTERPRISE">Enterprise (Net-30)</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="STARTER">Starter</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Custom Discount (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={newOrgDiscount}
                      onChange={(e) => setNewOrgDiscount(parseInt(e.target.value) || 0)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="border-border text-text hover:bg-surface-raised"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
                  >
                    Register Account
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
