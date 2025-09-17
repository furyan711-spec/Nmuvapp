import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BusinessData, UK_CITIES, BUSINESS_TYPES, INDUSTRIES } from "@/types/api";
import { Zap } from "lucide-react";

const businessFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  ukCity: z.string().min(1, "UK city is required"),
  industry: z.string().min(1, "Industry is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  servicesOffered: z.string().min(1, "Services offered is required"),
});

interface BusinessFormProps {
  onSubmit: (data: BusinessData, keywords: string[]) => void;
}

export function BusinessForm({ onSubmit }: BusinessFormProps) {
  const { toast } = useToast();
  
  const form = useForm<BusinessData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      ukCity: "",
      industry: "",
      targetAudience: "",
      servicesOffered: "",
    },
  });

  const generateKeywordsMutation = useMutation({
    mutationFn: async (data: BusinessData) => {
      const response = await apiRequest("POST", "/api/generate-keywords", data);
      return response.json();
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Keywords Generated",
          description: `Generated ${result.keywords.length} keywords using AI`,
        });
        onSubmit(variables, result.keywords);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate keywords",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate keywords. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BusinessData) => {
    generateKeywordsMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Tell us about your business</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" data-testid="business-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Joe's Coffee Shop" 
                        {...field} 
                        data-testid="input-business-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-business-type">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ukCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UK City/Town</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-uk-city">
                          <SelectValue placeholder="Select UK city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UK_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Young professionals aged 25-35, locals and tourists, coffee enthusiasts"
                      rows={3}
                      {...field}
                      data-testid="textarea-target-audience"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="servicesOffered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services Offered</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Specialty coffee, pastries, light lunch, Wi-Fi, meeting space"
                      rows={3}
                      {...field}
                      data-testid="textarea-services-offered"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={generateKeywordsMutation.isPending}
              data-testid="button-generate-keywords"
            >
              <Zap className="w-4 h-4 mr-2" />
              {generateKeywordsMutation.isPending ? "Generating Keywords..." : "Generate Keywords with AI"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
