import { createClient } from "@supabase/supabase-js";
import { idbStorage } from "./storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[Debug] VITE_SUPABASE_URL present:", !!supabaseUrl);
console.log("[Debug] VITE_SUPABASE_ANON_KEY present:", !!supabaseAnonKey);
console.log("[Debug] All Env Vars:", import.meta.env);

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: idbStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});
