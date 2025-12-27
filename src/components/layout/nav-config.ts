import { CheckSquare, Lightbulb, User } from "lucide-react";

export const NAV_ITEMS = [
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "todos", label: "Todos", icon: CheckSquare },
    { id: "profile", label: "Profile", icon: User },
] as const;
