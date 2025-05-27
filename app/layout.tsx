import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClerkProvider,
  SignedOut,
  SignedIn,
  UserButton,
  SignInButton,
  SignUpButton
 } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PostPilot - AI Social Media Content Assistant",
  description: "Generate engaging social media content with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
<SignedIn>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          </SignedIn>
          <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Welcome to PostPilot</h1>
            <p className="mb-4">Please sign in or sign up to continue.</p>
            <div className="flex space-x-4">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
            
          </div>
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  );
}
