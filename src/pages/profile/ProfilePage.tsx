// src/pages/profile/ProfilePage.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useData } from "@/hooks/use-data"; // Importar useData
import { supabase } from "@/lib/supabase";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
});

export default function ProfilePage() {
  const { user } = useAuth(); // Obter user do useAuth
  const { theme, toggleTheme, language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const { updateEmployee } = useData(); // Obter updateEmployee do useData
  const [isSubmitting, setIsSubmitting] = useState(false); // Manter este estado local para feedback do formulário

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
    // Resetar o formulário quando o usuário muda (se aplicável, ou ao carregar)
    values: { // Use `values` para controlar o formulário com dados externos
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }
  });

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Assumindo que o perfil do usuário corresponde a um registro na tabela 'employees'
      // E que o ID do usuário Supabase é o mesmo ID na tabela 'employees'
      await updateEmployee({
        id: user.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: user.role, // Manter o role atual do usuário
        startDate: user.startDate || new Date().toISOString(), // Pode precisar buscar ou adicionar esta info ao tipo User
        properties: user.properties || [], // Pode precisar buscar ou adicionar esta info ao tipo User
        // createdAt e updatedAt serão gerenciados pelo Supabase
      });

      // Se o email ou nome mudar, você pode querer atualizar o user_metadata no Supabase Auth também
      // Isso dependerá da sua implementação do AuthContext e de como você mantém esses dados sincronizados.
      const { error: updateAuthError } = await supabase.auth.updateUser({
          email: values.email,
          data: { name: values.name, phone: values.phone }
      });

      if (updateAuthError) throw updateAuthError;

      // Se o email ou nome mudar, o AuthContext deve re-sincronizar os dados do usuário.
      // Uma solução rápida (não ideal para todos os casos) é forçar uma re-validação ou re-login "silencioso".
      // Ou garantir que o onAuthStateChange no AuthContext lide com updates de user_metadata.
      // Por simplicidade, faremos um toast de sucesso.

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const message = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("profile.updateProfile")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
            <CardDescription>
              {t("profile.updateProfile")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.email")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.phone")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("common.loading") : t("common.save")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.appearance")}</CardTitle>
            <CardDescription>
              {t("common.settings")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5" />
                  <span>{t("common.darkMode")}</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>

              <Separator />

              {/* Language Selector */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Languages className="h-5 w-5" />
                  <span>{t("common.language")}</span>
                </div>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as "en" | "pt-br")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("common.english")}</SelectItem>
                    <SelectItem value="pt-br">{t("common.portuguese")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
