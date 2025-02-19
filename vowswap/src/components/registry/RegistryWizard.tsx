import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CreateRegistryRequest, PrivacyStatus } from "@/types/registry"

const registrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventType: z.string().min(1, "Event type is required"),
  description: z.string().optional(),
  privacyStatus: z.enum(["PUBLIC", "PRIVATE", "SHARED"] as const),
  coupleName1: z.string().min(1, "First partner's name is required"),
  coupleName2: z.string().optional(),
  eventLocation: z.string().optional(),
  coverImage: z.string().optional(),
  thankyouMessage: z.string().optional(),
})

type RegistryFormData = z.infer<typeof registrySchema>

const steps = [
  {
    title: "Basic Information",
    description: "Let's start with the basic details of your registry",
    fields: ["title", "eventType", "eventDate"],
  },
  {
    title: "Couple Details",
    description: "Tell us about the happy couple",
    fields: ["coupleName1", "coupleName2", "eventLocation"],
  },
  {
    title: "Additional Details",
    description: "Add some personal touches to your registry",
    fields: ["description", "coverImage", "thankyouMessage", "privacyStatus"],
  },
]

export default function RegistryWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistryFormData>({
    resolver: zodResolver(registrySchema),
    defaultValues: {
      privacyStatus: "PUBLIC" as PrivacyStatus,
      eventType: "WEDDING",
    },
  })

  const onSubmit = async (data: RegistryFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create registry")
      }

      const registry = await response.json()
      router.push(`/registry/${registry.id}`)
    } catch (error) {
      console.error("Error creating registry:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepFields = steps[currentStep].fields
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex-1 ${
                index < steps.length - 1 ? "border-b-2" : ""
              } ${
                index <= currentStep
                  ? "border-blue-500 text-blue-500"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <div className="relative">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-sm mt-2 text-center">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registry Title
              </label>
              <input
                type="text"
                {...register("title")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                {...register("eventType")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="WEDDING">Wedding</option>
                <option value="ENGAGEMENT">Engagement</option>
                <option value="ANNIVERSARY">Anniversary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                type="date"
                {...register("eventDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.eventDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.eventDate.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Step 2: Couple Details */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Partner 1 Name
              </label>
              <input
                type="text"
                {...register("coupleName1")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.coupleName1 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.coupleName1.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Partner 2 Name
              </label>
              <input
                type="text"
                {...register("coupleName2")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Location
              </label>
              <input
                type="text"
                {...register("eventLocation")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover Image URL
              </label>
              <input
                type="text"
                {...register("coverImage")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thank You Message
              </label>
              <textarea
                {...register("thankyouMessage")}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Privacy Status
              </label>
              <select
                {...register("privacyStatus")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="SHARED">Shared</option>
              </select>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
              currentStep === 0 ? "invisible" : ""
            }`}
          >
            Previous
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Creating..." : "Create Registry"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
