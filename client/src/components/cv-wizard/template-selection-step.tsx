import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { insertCvSchema, type Template } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, AlertCircle, Crown, Lock } from "lucide-react";
import { CVTemplatePreview } from "@/components/cv-template-preview";
import { dummyCvData } from "@/lib/dummyData";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface TemplateSelectionStepProps {
  form: UseFormReturn<z.infer<typeof insertCvSchema>>;
}

export function TemplateSelectionStep({ form }: TemplateSelectionStepProps) {
  const selectedTemplate = form.watch("templateId");

  const { data: templates = [], isLoading, error } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Fetch user plan status
  const { data: planStatus } = useQuery<{
    planId: string;
    planName: string;
    limits: Record<string, number>;
    usage: Record<string, number>;
    features: Record<string, boolean>;
  }>({
    queryKey: ["/api/user/plan-status"],
  });

  // Check if user has access to premium templates
  const userPlan = planStatus?.planName?.toLowerCase() || 'basic';
  const hasPremiumAccess = userPlan === 'premium';
  const canAccessPremiumTemplates = hasPremiumAccess || (planStatus?.limits?.templates || 0) >= 3;

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[3/4]" />
            <div className="p-4 border-t space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load templates</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="templateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg mb-4 block">
              Choose Your Template
            </FormLabel>
            <FormControl>
              <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      console.log('[TEMPLATE-STEP] Selecting template:', template.id);
                      field.onChange(template.id);
                    }}
                    data-testid={`card-template-${template.id}`}
                  >
                    <Card
                      className={`cursor-pointer overflow-hidden hover-elevate active-elevate-2 transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? "border-4 border-primary"
                          : "border-2"
                      }`}
                    >
                    <div className="relative">
                      <CVTemplatePreview
                        data={dummyCvData}
                        templateId={template.id}
                        containerAspect={[3, 4]}
                        showWatermark={false}
                        className="rounded-t-md"
                      />
                      
                      {/* Selection indicator overlay */}
                      {selectedTemplate === template.id && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                      
                      {/* Premium badge - only show if user doesn't have access */}
                      {template.isPremium === 1 && !canAccessPremiumTemplates && (
                        <Badge className="absolute top-3 right-3 bg-amber-500 z-10 shadow-lg">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {/* Unlocked badge for premium users */}
                      {template.isPremium === 1 && canAccessPremiumTemplates && (
                        <Badge className="absolute top-3 right-3 bg-green-500 z-10 shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 border-t">
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    </Card>
                  </div>
                ))}
              </div>
              </>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!selectedTemplate && (
        <p className="text-center text-muted-foreground text-sm mt-6">
          Select a template to continue
        </p>
      )}
    </div>
  );
}
