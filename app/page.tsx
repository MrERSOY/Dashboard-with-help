// app/page.tsx
import { redirect } from "next/navigation";

// Bu sayfa, kullanıcıyı doğrudan admin paneline yönlendirir.
// Herhangi bir prop almaz (özellikle 'children' almaz).
export default function HomePage() {
  redirect("/dashboard");

  // Yönlendirme işlemi yapıldıktan sonra bileşenin null döndürmesi
  // beklenmedik render hatalarını önler.
  return null;
}
