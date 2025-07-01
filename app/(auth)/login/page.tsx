// app/(auth)/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error || "Giriş bilgileri hatalı.");
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Beklenmedik bir hata oluştu.");
      console.error("Giriş sırasında bir hata oluştu:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg shadow-sm bg-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-card-foreground">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Veya{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/90"
            >
              yeni bir hesap oluşturun
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                E-posta adresi
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/90"
              >
                Şifrenizi mi unuttunuz?
              </a>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
