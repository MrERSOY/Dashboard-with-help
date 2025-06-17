// app/register/page.tsx
"use client"; // Form etkileşimi için Client Component

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // --- YENİ EKLENEN KISIM ---
    console.log("Form gönderme işlemi başlatıldı!");
    // --- YENİ EKLENEN KISIM SONU ---

    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    setIsLoading(true);

    try {
      // API rotamıza POST isteği gönderiyoruz
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Eğer API'den bir hata mesajı geldiyse, onu göster
        setError(data.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
      } else {
        // Başarılı kayıt sonrası
        alert("Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.");
        router.push("/login"); // Kullanıcıyı giriş sayfasına yönlendir
      }
    } catch (err) {
      console.error("Kayıt sırasında ağ hatası veya başka bir sorun:", err);
      setError("Kayıt işlemi sırasında bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg shadow-sm bg-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-card-foreground">
            Yeni hesap oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Zaten bir hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Adınız
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Adınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
                autoComplete="new-password"
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Şifreyi Onayla
              </label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
