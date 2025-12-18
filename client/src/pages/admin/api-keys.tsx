import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, Plus, Trash2, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKey {
  id: string;
  service: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceInfo {
  value: string;
  label: string;
  placeholder: string;
  link: string;
  description: string;
}

const SERVICES: ServiceInfo[] = [
  {
    value: "CLOUDINARY_CLOUD_NAME",
    label: "Cloudinary Cloud Name",
    placeholder: "dxyz123abc",
    link: "https://cloudinary.com/console",
    description: "For profile photo uploads and media storage"
  },
  {
    value: "CLOUDINARY_API_KEY",
    label: "Cloudinary API Key",
    placeholder: "123456789012345",
    link: "https://cloudinary.com/console",
    description: "For profile photo uploads and media storage"
  },
  {
    value: "CLOUDINARY_API_SECRET",
    label: "Cloudinary API Secret",
    placeholder: "abcdefGHIJKLMNOP123",
    link: "https://cloudinary.com/console",
    description: "For profile photo uploads and media storage"
  },
  {
    value: "CLERK_PUBLISHABLE_KEY",
    label: "Clerk Publishable Key",
    placeholder: "pk_test_...",
    link: "https://dashboard.clerk.com/",
    description: "For user authentication (frontend)"
  },
  {
    value: "CLERK_SECRET_KEY",
    label: "Clerk Secret Key",
    placeholder: "sk_test_...",
    link: "https://dashboard.clerk.com/",
    description: "For user authentication (backend)"
  },
  {
    value: "GROQ_API_KEY",
    label: "Groq AI API Key",
    placeholder: "gsk_...",
    link: "https://console.groq.com/keys",
    description: "For AI CV optimization and cover letters"
  },
  {
    value: "RESEND_API_KEY",
    label: "Resend API Key",
    placeholder: "re_...",
    link: "https://resend.com/api-keys",
    description: "For sending email notifications"
  },
  {
    value: "PAYSTACK_SECRET_KEY",
    label: "Paystack Secret Key",
    placeholder: "sk_test_...",
    link: "https://dashboard.paystack.com/#/settings/developer",
    description: "For payment processing (Ghana)"
  },
  {
    value: "PAYSTACK_PUBLIC_KEY",
    label: "Paystack Public Key",
    placeholder: "pk_test_...",
    link: "https://dashboard.paystack.com/#/settings/developer",
    description: "For payment processing (Ghana)"
  },
  {
    value: "DATABASE_URL",
    label: "Database URL",
    placeholder: "postgresql://...",
    link: "https://supabase.com/dashboard/projects",
    description: "PostgreSQL connection string"
  }
];

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyService, setNewKeyService] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<ServiceInfo | null>(null);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["/api/admin/api-keys"],
    queryFn: async () => {
      const response = await fetch("/api/admin/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return await response.json() as ApiKey[];
    },
  });

  const addKeyMutation = useMutation({
    mutationFn: async ({ service, key }: { service: string; key: string }) => {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, keyValue: key }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to add API key" }));
        throw new Error(error.error || "Failed to add API key");
      }
      return await response.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/api-keys"] });
      
      // Close dialog and reset state
      setIsAddDialogOpen(false);
      setNewKeyService("");
      setNewKeyValue("");
      setSelectedServiceInfo(null);
      
      toast({
        title: "API key saved",
        description: "The API key has been securely stored and will be used by the application",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await fetch(`/api/admin/api-keys/${service}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete API key" }));
        throw new Error(error.error || "Failed to delete API key");
      }
      return await response.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/api-keys"] });
      
      toast({
        title: "API key deleted",
        description: "The API key has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const maskKey = (key: string) => {
    if (key.length <= 8) return "********";
    return key.slice(0, 4) + "****" + key.slice(-4);
  };

  const toggleKeyVisibility = (service: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(service)) {
      newVisible.delete(service);
    } else {
      newVisible.add(service);
    }
    setVisibleKeys(newVisible);
  };

  const handleAddKey = () => {
    if (!newKeyService.trim() || !newKeyValue.trim()) {
      toast({
        title: "Missing fields",
        description: "Please select a service and provide the API key",
        variant: "destructive",
      });
      return;
    }
    addKeyMutation.mutate({ service: newKeyService.trim(), key: newKeyValue.trim() });
  };

  const handleServiceChange = (service: string) => {
    setNewKeyService(service);
    const info = SERVICES.find(s => s.value === service);
    setSelectedServiceInfo(info || null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  const getServiceStatus = (serviceName: string) => {
    return apiKeys.some(key => key.service === serviceName);
  };

  const requiredServices = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY", 
    "CLOUDINARY_API_SECRET",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "GROQ_API_KEY",
    "RESEND_API_KEY",
    "DATABASE_URL"
  ];

  const configuredCount = requiredServices.filter(getServiceStatus).length;
  const totalRequired = requiredServices.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
          <p className="text-muted-foreground">
            Configure API keys and credentials for third-party services
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-api-key">
              <Plus className="mr-2 h-4 w-4" />
              Configure Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure API Key</DialogTitle>
              <DialogDescription>
                Add or update your service API keys. These are securely stored and used by the application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={newKeyService} onValueChange={handleServiceChange}>
                  <SelectTrigger id="service" data-testid="select-service">
                    <SelectValue placeholder="Select a service to configure" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedServiceInfo && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-start justify-between gap-2">
                    <span className="text-sm">{selectedServiceInfo.description}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs underline"
                      onClick={() => window.open(selectedServiceInfo.link, '_blank')}
                    >
                      Get Key <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {selectedServiceInfo?.label || "API Key / Value"}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={selectedServiceInfo?.placeholder || "Enter the value"}
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  data-testid="input-api-key"
                  disabled={!newKeyService}
                />
                <p className="text-xs text-muted-foreground">
                  This will be securely stored in the database
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewKeyService("");
                  setNewKeyValue("");
                  setSelectedServiceInfo(null);
                }}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddKey}
                disabled={addKeyMutation.isPending || !newKeyService || !newKeyValue}
                data-testid="button-confirm-add"
              >
                {addKeyMutation.isPending ? "Saving..." : "Save Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configuration Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configuredCount}/{totalRequired}
            </div>
            <p className="text-xs text-muted-foreground">
              Required services configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getServiceStatus("CLERK_PUBLISHABLE_KEY") && getServiceStatus("CLERK_SECRET_KEY") ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Not configured</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">File Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getServiceStatus("CLOUDINARY_CLOUD_NAME") && 
               getServiceStatus("CLOUDINARY_API_KEY") && 
               getServiceStatus("CLOUDINARY_API_SECRET") ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Not configured</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getServiceStatus("GROQ_API_KEY") ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Not configured</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configured Keys
          </CardTitle>
          <CardDescription>
            {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} stored in database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No API keys configured
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((apiKey) => {
                    const serviceInfo = SERVICES.find(s => s.value === apiKey.service);
                    return (
                      <TableRow key={apiKey.id} data-testid={`row-api-key-${apiKey.service}`}>
                        <TableCell className="font-medium" data-testid={`service-${apiKey.service}`}>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline">{serviceInfo?.label || apiKey.service}</Badge>
                            {serviceInfo && (
                              <span className="text-xs text-muted-foreground">
                                {serviceInfo.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm" data-testid={`key-${apiKey.service}`}>
                          {visibleKeys.has(apiKey.service) ? apiKey.key : maskKey(apiKey.key)}
                        </TableCell>
                        <TableCell data-testid={`updated-${apiKey.service}`}>
                          {new Date(apiKey.updatedAt).toLocaleString()}
                        </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(apiKey.service)}
                            data-testid={`button-toggle-visibility-${apiKey.service}`}
                          >
                            {visibleKeys.has(apiKey.service) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteKeyMutation.mutate(apiKey.service)}
                            disabled={deleteKeyMutation.isPending}
                            data-testid={`button-delete-${apiKey.service}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
