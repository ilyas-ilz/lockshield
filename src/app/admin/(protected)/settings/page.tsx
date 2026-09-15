"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Save,
  Building,
  PhoneCall,
  Link2,
  Share2,
  Search as SearchIcon,
  BarChart3,
  Activity,
  Database,
  Server,
  Cloud,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { FieldInput } from "@/components/admin/fields/FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { api, ApiClientError } from "@/lib/admin/api-client";
import type { FieldConfig } from "@/lib/admin/field-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

const SECTIONS: {
  id: string;
  title: string;
  description?: string;
  icon: typeof Building;
  fields: FieldConfig[];
}[] = [
  {
    id: "identity",
    title: "Business Identity",
    description: "Legal brand details, registered company name, and official logo.",
    icon: Building,
    fields: [
      { name: "siteName", label: "Site Name", type: "text", required: true },
      { name: "legalName", label: "Legal (Registered) Name", type: "text", required: true },
      { name: "logoUrl", label: "Brand Logo", type: "image" },
    ],
  },
  {
    id: "contact",
    title: "Contact & NAP Details",
    description:
      "Official Name-Address-Phone (NAP) details used in footer, contact page, and Google LocalBusiness schema.",
    icon: PhoneCall,
    fields: [
      { name: "phones", label: "Phone Numbers", type: "stringArray" },
      { name: "whatsapp", label: "WhatsApp Number", type: "text" },
      { name: "emails", label: "Email Addresses", type: "stringArray" },
      { name: "address.poBox", label: "PO Box", type: "text" },
      { name: "address.street", label: "Street Address", type: "text" },
      { name: "address.locality", label: "City / Emirate", type: "text" },
      { name: "address.country", label: "Country Code", type: "text", help: "Two letters, e.g. AE" },
    ],
  },
  {
    id: "backlinks",
    title: "Partner Backlinks",
    description:
      "Strategic backlinks to lockshieldcart.com with varied anchor text to maintain healthy search rankings.",
    icon: Link2,
    fields: [
      {
        name: "partnerLinks",
        label: "Links",
        type: "objectArray",
        itemFields: [
          { name: "label", label: "Anchor Text", type: "text", required: true },
          { name: "url", label: "Target URL", type: "text", required: true },
          { name: "rel", label: "rel Attribute", type: "text", defaultValue: "noopener" },
        ],
      },
    ],
  },
  {
    id: "socials",
    title: "Social Profiles",
    description: "Official social media channels displayed in the website footer.",
    icon: Share2,
    fields: [
      {
        name: "socials",
        label: "Profiles",
        type: "objectArray",
        itemFields: [
          { name: "platform", label: "Platform (e.g. LinkedIn, Instagram, Facebook)", type: "text", required: true },
          { name: "url", label: "Profile URL", type: "text", required: true },
        ],
      },
    ],
  },
  {
    id: "seo",
    title: "Default SEO",
    description: "Fallback meta title and description used when a page has no custom metadata.",
    icon: SearchIcon,
    fields: [
      { name: "defaultSeo.title", label: "Default SEO Title", type: "text" },
      { name: "defaultSeo.description", label: "Default Meta Description", type: "textarea" },
      { name: "footerNote", label: "Footer Copyright / Compliance Note", type: "textarea" },
    ],
  },
  {
    id: "analytics",
    title: "Tracking & Analytics",
    description: "Measurement and tracking tags for Google Analytics and Google Tag Manager.",
    icon: BarChart3,
    fields: [
      { name: "analytics.gaId", label: "Google Analytics ID (GA4)", type: "text", help: "e.g. G-XXXXXXXXXX" },
      { name: "analytics.gtmId", label: "Google Tag Manager ID", type: "text", help: "e.g. GTM-XXXXXXX" },
    ],
  },
  {
    id: "system",
    title: "System & Health",
    description: "Database connectivity, storage backend, environment status, and runtime diagnostics.",
    icon: Activity,
    fields: [],
  },
];

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [activeSection, setActiveSection] = useState<string>("identity");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api.get<Record<string, unknown>>("/api/settings"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      setData(await api.patch<Record<string, unknown>>("/api/settings", data));
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0]!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Global business information, contact channels, partner links, and SEO metadata."
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-app pb-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-surface border border-app text-foreground font-semibold shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-surface-2/60"
                  )}
                >
                  <Icon className={cn("size-3.5", isActive ? "text-[var(--brand-red,#e01b24)]" : "text-muted")} />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Card */}
          {activeSection === "system" ? (
            <SystemHealthSection />
          ) : (
            <>
              <Card className="border-app shadow-xs">
                <CardHeader className="px-6 py-4 border-b border-app bg-surface-2/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surface border border-app text-foreground">
                      <currentSection.icon className="size-4 text-[var(--brand-red,#e01b24)]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{currentSection.title}</CardTitle>
                      {currentSection.description && (
                        <p className="mt-0.5 text-xs text-muted">{currentSection.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {currentSection.fields.map((field) => {
                    const fieldId = `settings-${field.name.replace(/\./g, "-")}`;
                    return (
                      <Field
                        key={field.name}
                        label={field.label}
                        htmlFor={fieldId}
                        required={field.required}
                        help={field.help}
                      >
                        <FieldInput
                          id={fieldId}
                          field={field}
                          value={getPath(data, field.name)}
                          onChange={(v) => setData((prev) => setPath(prev!, field.name, v))}
                        />
                      </Field>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Sticky Save Bar */}
              <div className="sticky bottom-0 z-10 -mx-4 border-t border-app bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted hidden sm:inline">
                    Changes apply instantly across all pages and footer structured data.
                  </span>
                  <Button type="submit" variant="primary" loading={saving} className="w-full sm:w-auto">
                    {!saving && <Save className="size-4 mr-1.5" aria-hidden />}
                    {saving ? "Saving settings…" : "Save all settings"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

function SystemHealthSection() {
  const [health, setHealth] = useState<{
    database?: { status: string; provider: string; pingMs: number; name: string };
    storage?: { provider: string; isCloudinary: boolean };
    system?: { nodeVersion: string; environment: string; timestamp: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.get<{
        database: { status: string; provider: string; pingMs: number; name: string };
        storage: { provider: string; isCloudinary: boolean };
        system: { nodeVersion: string; environment: string; timestamp: string };
      }>("/api/admin/health");
      setHealth(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchHealth();
  };

  return (
    <Card className="border-app shadow-xs">
      <CardHeader className="px-6 py-4 border-b border-app bg-surface-2/30 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface border border-app text-foreground">
            <Activity className="size-4 text-[var(--color-brand-500)]" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">System & Infrastructure Diagnostics</CardTitle>
            <p className="mt-0.5 text-xs text-muted">Technical infrastructure health, database connection, and storage provider.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="text-xs"
        >
          <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database */}
            <div className="p-4 rounded-xl border border-app bg-surface-2/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Database className="size-4 text-emerald-500" />
                  <span>Database</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {health?.database?.status === "connected" ? "Connected" : "Online"}
                </span>
              </div>
              <div className="text-xs text-muted space-y-1 pt-1">
                <p className="font-medium text-foreground">{health?.database?.provider ?? "MongoDB Atlas"}</p>
                <p>Latency: <span className="font-mono text-foreground">{health?.database?.pingMs ?? 0}ms</span></p>
                <p>Database: <span className="font-mono text-foreground">{health?.database?.name ?? "lockshield"}</span></p>
              </div>
            </div>

            {/* Storage */}
            <div className="p-4 rounded-xl border border-app bg-surface-2/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  {health?.storage?.isCloudinary ? (
                    <Cloud className="size-4 text-blue-500" />
                  ) : (
                    <HardDrive className="size-4 text-amber-500" />
                  )}
                  <span>Media Storage</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Active
                </span>
              </div>
              <div className="text-xs text-muted space-y-1 pt-1">
                <p className="font-medium text-foreground">{health?.storage?.provider ?? "Cloudinary CDN"}</p>
                <p>{health?.storage?.isCloudinary ? "Multi-region CDN delivery" : "Local uploads storage"}</p>
                <p>Assets served: <span className="text-foreground">Optimized</span></p>
              </div>
            </div>

            {/* Runtime */}
            <div className="p-4 rounded-xl border border-app bg-surface-2/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground text-sm font-semibold">
                  <Server className="size-4 text-purple-500" />
                  <span>Runtime</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Ready
                </span>
              </div>
              <div className="text-xs text-muted space-y-1 pt-1">
                <p>Environment: <span className="font-mono capitalize text-foreground">{health?.system?.environment ?? "development"}</span></p>
                <p>Node: <span className="font-mono text-foreground">{health?.system?.nodeVersion ?? process.version}</span></p>
                <p>Status: <span className="text-foreground font-medium">All systems operational</span></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
