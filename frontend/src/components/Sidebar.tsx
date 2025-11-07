import { LayoutDashboard, FileText, Folder, Building2, Users, Settings, MessageSquare } from "lucide-react";
import { NavLink } from "./NavLink";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", enabled: true },
  { icon: MessageSquare, label: "Chat with Data", path: "/chat", enabled: true },
  { icon: FileText, label: "Invoice", path: "/invoice", enabled: false },
  { icon: Folder, label: "Other files", path: "/files", enabled: false },
  { icon: Building2, label: "Departments", path: "/departments", enabled: false },
  { icon: Users, label: "Users", path: "/users", enabled: false },
  { icon: Settings, label: "Settings", path: "/settings", enabled: false },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Buchhaltung</h1>
          <p className="text-xs text-gray-500">by Flowbit AI</p>
        </div>
      </div>

      <nav className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 mb-3 px-3">GENERAL</p>
        {navItems.map((item) => (
          item.enabled ? (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              activeClassName="bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ) : (
            <div
              key={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed opacity-50"
              title="Coming soon"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          )
        ))}
      </nav>
    </aside>
  );
};
