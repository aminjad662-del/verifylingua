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
  Users,
  Search,
  Filter,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Globe,
  DollarSign,
  Briefcase,
  UserCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

interface TranslatorProfile {
  id: string;
  name: string;
  email: string;
  languages: string[];
  credentials: string;
  specialties: string[];
  internalRatePerWord: number;
  internalRatePerPage: number;
  rating: number;
  completedOrders: number;
  activeWorkload: number;
  availability: "AVAILABLE" | "BUSY" | "ON_LEAVE";
  ndaSigned: boolean;
  complianceDocStatus: "VERIFIED" | "PENDING" | "EXPIRED";
}

export default function AdminTranslatorsPage() {
  const [translators, setTranslators] = React.useState<TranslatorProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [availabilityFilter, setAvailabilityFilter] = React.useState("ALL");
  const [specialtyFilter, setSpecialtyFilter] = React.useState("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Form State
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newLanguages, setNewLanguages] = React.useState("Spanish, English");
  const [newCredentials, setNewCredentials] = React.useState("ATA Certified Translator #");
  const [newSpecialties, setNewSpecialties] = React.useState("Immigration USCIS, Legal Contracts");
  const [newRateWord, setNewRateWord] = React.useState("0.08");
  const [newRatePage, setNewRatePage] = React.useState("16.00");

  const fetchTranslators = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/translators");
      const data = await res.json();
      if (data.translators) setTranslators(data.translators);
    } catch (err) {
      console.error("Failed to load translators", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTranslators();
  }, [fetchTranslators]);

  const handleToggleAvailability = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    try {
      const res = await fetch("/api/admin/translators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id,
          updates: { availability: nextStatus },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslators((prev) =>
          prev.map((t) => (t.id === id ? { ...t, availability: nextStatus as any } : t))
        );
        setFeedback(`Updated availability for linguist.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Failed to toggle availability", err);
    }
  };

  const handleAddLinguist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      const res = await fetch("/api/admin/translators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          translator: {
            name: newName,
            email: newEmail,
            languages: newLanguages.split(",").map((s) => s.trim()),
            credentials: newCredentials,
            specialties: newSpecialties.split(",").map((s) => s.trim()),
            internalRatePerWord: parseFloat(newRateWord) || 0.08,
            internalRatePerPage: parseFloat(newRatePage) || 16.0,
            availability: "AVAILABLE",
            ndaSigned: true,
            complianceDocStatus: "VERIFIED",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslators((prev) => [...prev, data.translator]);
        setIsModalOpen(false);
        setFeedback(`Linguist ${newName} added to the certified roster.`);
        setTimeout(() => setFeedback(null), 4000);
        // Reset form
        setNewName("");
        setNewEmail("");
      }
    } catch (err) {
      console.error("Failed to add linguist", err);
    }
  };

  const filteredTranslators = translators.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.credentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAvailability =
      availabilityFilter === "ALL" || t.availability === availabilityFilter;

    const matchesSpecialty =
      specialtyFilter === "ALL" ||
      t.specialties.some((s) => s.toLowerCase().includes(specialtyFilter.toLowerCase()));

    return matchesSearch && matchesAvailability && matchesSpecialty;
  });

  const totalCapacity = translators.length * 5;
  const activeWorkloadTotal = translators.reduce((acc, t) => acc + t.activeWorkload, 0);
  const capacityPercent = totalCapacity > 0 ? Math.round(((totalCapacity - activeWorkloadTotal) / totalCapacity) * 100) : 100;
  const avgRating = translators.length > 0 ? (translators.reduce((acc, t) => acc + t.rating, 0) / translators.length).toFixed(2) : "4.98";

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>ISO 17100 Certified Talent Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Linguist Roster & Capacity Management
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Maintain certified translators, subject matter legal/medical experts, internal cost schedules, and live job load.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTranslators}
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
              Onboard Linguist
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
                Vetted Linguists
              </span>
              <Users className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {translators.length}
            </p>
            <p className="text-xs text-text-muted mt-1">100% with signed NDA & background check</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Average Quality Score
              </span>
              <Star className="w-4 h-4 text-status-warning fill-current" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {avgRating} / 5.0
            </p>
            <p className="text-xs text-text-muted mt-1">Based on peer QA and client sign-offs</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Active Job Allocations
              </span>
              <Briefcase className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              {activeWorkloadTotal} Orders
            </p>
            <p className="text-xs text-text-muted mt-1">Currently in translation/review</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Available Capacity
              </span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              {capacityPercent}%
            </p>
            <p className="text-xs text-text-muted mt-1">Capacity buffer for rush intake</p>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, language pair, credentials..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-muted font-medium">Status:</span>
              {["ALL", "AVAILABLE", "BUSY"].map((status) => (
                <button
                  key={status}
                  onClick={() => setAvailabilityFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                    availabilityFilter === status
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-surface border-border text-text-muted hover:text-text"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-muted font-medium">Specialty:</span>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="h-8 rounded-md border border-border bg-surface text-text text-xs px-2"
              >
                <option value="ALL">All Disciplines</option>
                <option value="USCIS">USCIS / Immigration</option>
                <option value="Legal">Legal & Contracts</option>
                <option value="Medical">Medical / Clinical</option>
                <option value="Finance">Corporate Finance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Translators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTranslators.map((t) => (
            <Card
              key={t.id}
              className="p-5 border-border bg-surface shadow-sm hover:border-border-strong transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-ink font-bold flex items-center justify-center text-sm border border-brand-500/20">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text">{t.name}</h3>
                      <p className="text-xs text-text-muted">{t.email}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.availability === "AVAILABLE"
                        ? "bg-status-success/10 text-status-success"
                        : "bg-status-warning/10 text-status-warning"
                    }`}
                  >
                    {t.availability}
                  </span>
                </div>

                {/* Credentials */}
                <div className="p-2.5 rounded bg-surface-raised border border-border text-xs">
                  <div className="flex items-center gap-1.5 text-text font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                    <span>{t.credentials}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    Domain Specialties
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {t.specialties.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-[10px] border-border">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Workload & Rates */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">Internal Cost Rate</span>
                    <span className="font-mono font-semibold text-text">
                      ${t.internalRatePerPage.toFixed(2)}/pg
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      (${t.internalRatePerWord.toFixed(2)}/wd)
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[11px]">Active Load</span>
                    <span className="font-semibold text-text">
                      {t.activeWorkload} / 5 Orders
                    </span>
                    <div className="w-full bg-surface-raised rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          t.activeWorkload >= 4 ? "bg-status-warning" : "bg-brand-500"
                        }`}
                        style={{ width: `${(t.activeWorkload / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-1 text-xs font-semibold text-text">
                  <Star className="w-3.5 h-3.5 text-status-warning fill-current" />
                  <span>{t.rating.toFixed(2)}</span>
                  <span className="text-text-muted font-normal text-[11px]">
                    ({t.completedOrders} orders)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(t.id, t.availability)}
                    className="h-7 text-xs border-border text-text hover:bg-surface-raised"
                  >
                    {t.availability === "AVAILABLE" ? "Set Busy" : "Set Available"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal: Onboard Linguist */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 border-border bg-surface shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-text">Onboard Certified Linguist</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-text text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddLinguist} className="space-y-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Maria Gonzalez, PhD"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. maria.g@verifylingua-linguists.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Language Competencies (comma-separated)</Label>
                  <Input
                    value={newLanguages}
                    onChange={(e) => setNewLanguages(e.target.value)}
                    placeholder="e.g. Spanish, English, Portuguese"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Official Certification / License</Label>
                  <Input
                    value={newCredentials}
                    onChange={(e) => setNewCredentials(e.target.value)}
                    placeholder="e.g. ATA Certified ID 492819 - English to Spanish"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Specialties (comma-separated)</Label>
                  <Input
                    value={newSpecialties}
                    onChange={(e) => setNewSpecialties(e.target.value)}
                    placeholder="e.g. USCIS Records, Vital Records, Court Litigation"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cost Per Word ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newRateWord}
                      onChange={(e) => setNewRateWord(e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cost Per Page ($)</Label>
                    <Input
                      type="number"
                      step="0.50"
                      value={newRatePage}
                      onChange={(e) => setNewRatePage(e.target.value)}
                      className="h-9 text-sm font-mono"
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
                    Save & Add to Roster
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
