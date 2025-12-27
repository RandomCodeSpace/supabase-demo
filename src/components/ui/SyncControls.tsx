import { RefreshCw, UploadCloud } from "lucide-react";
import { useState } from "react";
import { SyncService } from "../../backbone/services/syncService";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../backbone/lib/utils";

export function SyncControls() {
    const [isSyncing, setIsSyncing] = useState(false);
    const { success, error } = useToast();

    const handlePull = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await SyncService.pullChanges();
            success("Data refreshed");
        } catch (err) {
            console.error(err);
            error("Failed to refresh data");
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePush = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await SyncService.pushImmediately();
            success("Local changes uploaded");
        } catch (err) {
            console.error(err);
            error("Failed to upload changes");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <button
                onClick={handlePull}
                disabled={isSyncing}
                className={cn(
                    "p-2 bg-zen-surface/80 backdrop-blur-md border border-white/10 rounded-full text-zen-text-muted hover:text-zen-text hover:bg-white/10 transition-all shadow-lg",
                    isSyncing && "opacity-50 cursor-not-allowed"
                )}
                title="Pull / Refresh Data"
            >
                <RefreshCw size={20} className={cn(isSyncing && "animate-spin")} />
            </button>
            <button
                onClick={handlePush}
                disabled={isSyncing}
                className={cn(
                    "p-2 bg-zen-surface/80 backdrop-blur-md border border-white/10 rounded-full text-zen-text-muted hover:text-zen-text hover:bg-white/10 transition-all shadow-lg",
                    isSyncing && "opacity-50 cursor-not-allowed"
                )}
                title="Push Local Changes"
            >
                <UploadCloud size={20} />
            </button>
        </div>
    );
}
