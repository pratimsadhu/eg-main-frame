'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string, redirectTo: string) => Promise<void>;
	signup: (formData: FormData) => Promise<void>;
	signOut: () => Promise<void>;
	signingOut: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	// Initialize states for user, loading, and signing out
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [signingOut, setSigningOut] = useState(false);

	// Create a Supabase client and Next.js router
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			const { data, error } = await supabase.auth.getUser();
			if (error) {
				setUser(null);
			} else {
				setUser(data.user);
			}
			setLoading(false);
		};

		// Listen for auth state changes
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user) {
				setUser(session.user);
			} else {
				setUser(null);
			}
		});

		fetchUser();
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	const signIn = async (email: string, password: string, redirectTo: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			throw error;
		}
		if (data?.user) {
			setUser(data.user);
			router.push(redirectTo);
		}
	};

	const signup = async (formData: FormData) => {
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();

		if (!email || !password) {
			return;
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { firstName, lastName },
			},
		});
		if (error) {
			throw error;
		}
		if (data?.user) {
			setUser(data.user);
			router.push('/dashboard');
		}
	};

	const signOut = async () => {
		setSigningOut(true);
		await supabase.auth.signOut();

		// Redirect to the homepage
		router.push('/');

		// Reset the user and signing out state
		setTimeout(() => {
			setUser(null);
			setSigningOut(false);
		}, 100);
	};

	const value = { user, loading, signOut, signIn, signup, signingOut };

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
