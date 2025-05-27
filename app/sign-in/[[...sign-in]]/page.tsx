import { SignIn } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-gray-800 border border-gray-700",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-300",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-gray-700 text-white border-gray-600",
            footerActionLink: "text-blue-400 hover:text-blue-300",
            identityPreviewText: "text-gray-300",
            identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
          },
        }}
      />
    </div>
  );
}
