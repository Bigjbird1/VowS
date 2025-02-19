import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import RegistryWizard from "@/components/registry/RegistryWizard"

export const metadata: Metadata = {
  title: "Create Registry | VowSwap",
  description: "Create your wedding registry on VowSwap",
}

export default async function NewRegistryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/registry/new")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Registry</h1>
      <p className="text-center text-gray-600 mb-8">
        Follow the steps below to create your wedding registry. You can save your progress
        and come back to it later.
      </p>
      <RegistryWizard />
    </div>
  )
}
