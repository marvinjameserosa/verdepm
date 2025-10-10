import React from "react";
import { Calendar, CreditCard, Wallet } from "lucide-react";
import List01 from "./list-01";
import List02 from "./list-02";
import List03 from "./list-03";

interface CardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const Card = ({ icon: Icon, title, children }: CardProps) => {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
        {title}
      </h2>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Accounts" icon={Wallet}>
          <List01 className="h-full" />
        </Card>

        <Card title="Recent Transactions" icon={CreditCard}>
          <List02 className="h-full" />
        </Card>
      </div>

      <Card title="Upcoming Events" icon={Calendar}>
        <List03 />
      </Card>
    </div>
  );
}
