// app/dashboard/team/page.tsx
import type { Metadata } from "next";
import { Users2, MailPlus } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Kullanıcılar | Dashboard",
};

// Örnek Kullanıcı Verisi
const teamMembers = [
  {
    id: "u01",
    name: "Ali Veli",
    email: "ali.veli@acme.com",
    role: "Yönetici",
    avatar: "/images/avatars/avatar-1.png",
    status: "Aktif",
  },
  {
    id: "u02",
    name: "Ayşe Fatma",
    email: "ayse.f@acme.com",
    role: "Editör",
    avatar: "/images/avatars/avatar-2.png",
    status: "Aktif",
  },
  {
    id: "u03",
    name: "Hasan Hüseyin",
    email: "hasan.h@acme.com",
    role: "Geliştirici",
    avatar: "/images/avatars/avatar-3.png",
    status: "Aktif",
  },
  {
    id: "u04",
    name: "Zeynep Sude",
    email: "zeynep.sude@acme.com",
    role: "İzleyici",
    avatar: "/images/avatars/avatar-4.png",
    status: "Pasif",
  },
  {
    id: "u05",
    name: "Mehmet Can",
    email: "mehmet.can@acme.com",
    role: "Editör",
    avatar: "/images/avatars/avatar-5.png",
    status: "Beklemede",
  },
];

export default function TeamPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Users2 className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <MailPlus size={18} />
          Yeni Kullanıcı Davet Et
        </button>
      </div>
      <p className="text-gray-600 mb-8">
        Ekip üyelerini görüntüleyin, rollerini ve izinlerini yönetin.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <li
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">{member.role}</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === "Aktif"
                      ? "bg-green-100 text-green-800"
                      : member.status === "Beklemede"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  ...
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
