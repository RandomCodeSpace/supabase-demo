import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-full border border-border/50">
            <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => setTheme("light")}
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => setTheme("system")}
            >
                <Monitor className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => setTheme("dark")}
            >
                <Moon className="h-4 w-4" />
            </Button>
        </div>
    )
}
