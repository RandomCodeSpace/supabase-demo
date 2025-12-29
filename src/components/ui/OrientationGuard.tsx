import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export function OrientationGuard() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const checkOrientation = () => {
			// Check if device is in landscape AND screen width is small (iPhone/mobile/small tablet)
			const isLandscape = window.matchMedia("(orientation: landscape)").matches;
			// 932px covers iPhone 14 Pro Max length. 1024px covers iPad Mini.
			const isMobileWidth = window.matchMedia("(max-width: 1024px)").matches;
			// Also checking height to avoid triggering on small desktop windows that are just wide
			const isMobileHeight = window.matchMedia("(max-height: 500px)").matches;

			// Combined check: Landscape AND (Small Width OR Small Height)
			// This targets phones turned sideways.
			setIsVisible(isLandscape && (isMobileWidth || isMobileHeight));
		};

		// Check on mount
		checkOrientation();

		// Listen for resize/orientation changes
		window.addEventListener("resize", checkOrientation);
		return () => window.removeEventListener("resize", checkOrientation);
	}, []);

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
			<div className="relative mb-8">
				<Smartphone
					size={64}
					className="text-white animate-[spin_3s_ease-in-out_infinite]"
				/>
			</div>
			<h2 className="text-2xl font-bold text-white mb-4">
				Please Rotate Your Device
			</h2>
			<p className="text-white/70 max-w-xs mx-auto">
				This application is designed for portrait mode to give you the best
				focused experience.
			</p>
		</div>
	);
}
