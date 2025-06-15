// components/site-header.tsx
// Projenin ilerleyen aşamalarında kullanıcı menüsü veya bildirimler eklenebilir.

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <div className="flex w-full items-center gap-4">
        {/* Başlık - Bu, sayfa değiştikçe dinamik olarak güncellenebilir */}
        <h1 className="text-base font-semibold">Dashboard</h1>

        {/*
          Sağ tarafa gelecekte eklenebilecekler için bir alan.
          Örneğin: Kullanıcı Profili, Bildirimler
        */}
        <div className="ml-auto flex items-center gap-2">
          {/* <UserProfile /> */}
          {/* <Notifications /> */}
        </div>
      </div>
    </header>
  );
}
