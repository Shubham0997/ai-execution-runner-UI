import React from 'react';
import { Play, History, Bookmark, Settings, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navItems = [
        { icon: Play, label: 'New Execution', id: 'new' },
        { icon: History, label: 'History', id: 'history' },
        { icon: Bookmark, label: 'Saved Prompts', id: 'saved' },
        { icon: Settings, label: 'Settings', id: 'settings' },
    ];

    return (
        <aside
            className={cn(
                'flex flex-col border-r border-border bg-panel transition-all duration-300 ease-in-out',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex h-14 items-center justify-between px-4 border-b border-border">
                {!collapsed && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        <span className="font-semibold tracking-wide text-zinc-100 whitespace-nowrap">Agent Runner</span>
                    </div>
                )}
                {collapsed && (
                    <LayoutDashboard className="h-5 w-5 text-primary mx-auto" />
                )}
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100',
                                    collapsed && 'justify-center px-0'
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={onToggle}
                    className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {collapsed ? '>>' : 'Collapse Sidebar'}
                </button>
            </div>
        </aside>
    );
};
