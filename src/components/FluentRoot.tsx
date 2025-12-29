import {
    FluentProvider,
    webDarkTheme,
    webLightTheme,
    makeStyles,
    tokens,
    shorthands,
} from "@fluentui/react-components";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
    root: {
        height: "100dvh",
        ...shorthands.overflow("hidden"),
        overscrollBehavior: "none",
        display: "flex",
        flexDirection: "column",
        backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
        // Font setup (Fluent uses Segoe UI by default)
        fontFamily: tokens.fontFamilyBase,
    },
});

interface FluentRootProps {
    children: React.ReactNode;
}

export function FluentRoot({ children }: FluentRootProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const styles = useStyles();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const currentTheme = resolvedTheme === "dark" ? webDarkTheme : webLightTheme;

    return (
        <FluentProvider theme={currentTheme} className={styles.root}>
            {children}
        </FluentProvider>
    );
}
