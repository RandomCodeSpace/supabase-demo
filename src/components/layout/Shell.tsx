import {
    makeStyles,
    tokens,
    TabList,
    Tab,
    shorthands,
} from "@fluentui/react-components";
import type { SelectTabData } from "@fluentui/react-components";
import {
    Lightbulb24Regular,
    Lightbulb24Filled,
    CheckmarkCircle24Regular,
    CheckmarkCircle24Filled,
    Person24Regular,
    Person24Filled,
    bundleIcon,
} from "@fluentui/react-icons";
import * as React from "react";

const LightbulbIcon = bundleIcon(Lightbulb24Filled, Lightbulb24Regular);
const CheckIcon = bundleIcon(CheckmarkCircle24Filled, CheckmarkCircle24Regular);
const PersonIcon = bundleIcon(Person24Filled, Person24Regular);

const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        // Desktop: Row adaptation handled via media queries or JS logic
        // For now, mobile-first column layout
        "@media (min-width: 768px)": {
            flexDirection: "row",
        },
    },
    contentNode: {
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        display: "flex", // Ensure content fills
        flexDirection: "column",
    },
    navContainer: {
        backgroundColor: tokens.colorNeutralBackground2, // Slightly different shade
        ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
        display: "flex",
        justifyContent: "center",
        paddingBottom: "env(safe-area-inset-bottom)", // Safety for iOS

        "@media (min-width: 768px)": {
            ...shorthands.borderTop("none"),
            ...shorthands.borderRight("1px", "solid", tokens.colorNeutralStroke2),
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingBottom: "0",
            width: "auto", // Let TabList define width or fixed
            minWidth: "60px",
        }
    },
    tabList: {
        width: "100%",
        justifyContent: "space-around",
        "@media (min-width: 768px)": {
            flexDirection: "column",
            height: "100%",
            width: "auto",
            justifyContent: "flex-start",
            ...shorthands.padding("10px", "0"),
            gap: "10px"
        }
    },
    desktopSidebar: {
        // Explicit desktop styling if needed
    }
});

interface ShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Shell({ children, activeTab, onTabChange }: ShellProps) {
    const styles = useStyles();

    const handleTabSelect = (_: unknown, data: SelectTabData) => {
        onTabChange(data.value as string);
    };

    return (
        <div className={styles.root}>
            {/* Main Content Area */}
            <div className={styles.contentNode}>
                {children}
            </div>

            {/* Navigation Layer */}
            <div className={styles.navContainer}>
                <TabList
                    selectedValue={activeTab}
                    onTabSelect={handleTabSelect}
                    className={styles.tabList}
                // Horizontal by default (mobile), Vertical on desktop logic needs explicit prop?
                // Fluent TabList 'vertical' prop changes orientation.
                // We might need responsive conditional or CSS-only approach.
                // CSS-only flex-direction on TabList container works, but accessibility?
                // Ideally check media query for 'vertical' prop.
                >
                    <Tab value="ideas" icon={<LightbulbIcon />}>
                        Ideas
                    </Tab>
                    <Tab value="todos" icon={<CheckIcon />}>
                        Todos
                    </Tab>
                    <Tab value="profile" icon={<PersonIcon />}>
                        Profile
                    </Tab>
                </TabList>
            </div>
        </div>
    );
}
