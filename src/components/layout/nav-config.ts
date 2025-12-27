import { CheckSquare, Lightbulb, User } from "lucide-react";

export const NAV_ITEMS = [
    { id: "todos", label: "Todos", icon: CheckSquare },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "profile", label: "Profile", icon: User },
] as const;
