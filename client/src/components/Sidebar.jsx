import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  MenuIcon,
  UserIcon,
  XIcon,
  LayoutGridIcon,
  CalendarIcon,
  FileTextIcon,
  DollarSignIcon,
  SettingsIcon,
  ChevronRightIcon,
  LogOutIcon,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuth();

  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      if (data.firstName) {
        setUserName(
          `${data.firstName} ${data.lastName || ""}`.trim()
        );
      }
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGridIcon,
    },
    role === "ADMIN"
      ? {
          name: "Employees",
          href: "/employees",
          icon: UserIcon,
        }
      : {
          name: "Attendance",
          href: "/attendance",
          icon: CalendarIcon,
        },
    {
      name: "Leave",
      href: "/leave",
      icon: FileTextIcon,
    },
    {
      name: "Payslips",
      href: "/payslips",
      icon: DollarSignIcon,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: SettingsIcon,
    },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserIcon className="size-7 text-white" />

            <div>
              <p className="text-[13px] font-semibold tracking-wide text-white">
                Employee MS
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Management System
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      {userName && (
        <div className="mx-3 mt-4 mb-1 rounded-lg border border-white/4 bg-white/3 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 ring-1 ring-white/10">
              <span className="text-xs font-semibold text-slate-400">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-slate-200">
                {userName}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {role === "ADMIN" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Navigation
        </p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-3 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/12 text-indigo-300"
                    : "text-slate-300 hover:bg-white/4"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500" />
                )}

                <item.icon
                  className={`h-[17px] w-[17px] shrink-0 ${
                    isActive
                      ? "text-indigo-300"
                      : "text-slate-400 group-hover:text-slate-300"
                  }`}
                />

                <span className="flex-1">{item.name}</span>

                {isActive && (
                  <ChevronRightIcon className="h-3.5 w-3.5 text-indigo-500/50" />
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Logout */}
      <div className="border-t border-white/6 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-all duration-150 hover:bg-rose-500/8 hover:text-rose-400"
        >
          <LogOutIcon className="h-[17px] w-[17px]" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-white/10 bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        <MenuIcon size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-65 shrink-0 flex-col border-r border-white/4 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;