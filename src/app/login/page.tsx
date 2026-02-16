import { prisma } from "@/lib/db";
import { LoginCards } from "./login-cards";

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    include: { organization: true },
    orderBy: { role: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">AI Front Desk</h1>
        <p className="text-slate-500 mt-2">Select your account to get started</p>
      </div>
      <LoginCards users={users} />
    </div>
  );
}
