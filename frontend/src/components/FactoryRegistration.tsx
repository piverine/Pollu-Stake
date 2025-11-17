'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface FactoryRegistrationData {
  factoryName: string
  ownerName: string
  factoryLicense: File | null
  location: string
  bondSize: string
}

interface FactoryRegistrationProps {
  onSuccess?: (data: FactoryRegistrationData) => void
  onCancel?: () => void
}

export function FactoryRegistration({ onSuccess, onCancel }: FactoryRegistrationProps) {
  const [formData, setFormData] = useState<FactoryRegistrationData>({
    factoryName: '',
    ownerName: '',
    factoryLicense: null,
    location: '',
    bondSize: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FactoryRegistrationData, string>>>({})
  const [licenseFileName, setLicenseFileName] = useState<string>('')

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FactoryRegistrationData, string>> = {}

    if (!formData.factoryName.trim()) {
      newErrors.factoryName = 'Factory name is required'
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required'
    }
    if (!formData.factoryLicense) {
      newErrors.factoryLicense = 'Factory license file is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.bondSize.trim()) {
      newErrors.bondSize = 'Bond size is required'
    } else if (isNaN(parseFloat(formData.bondSize)) || parseFloat(formData.bondSize) <= 0) {
      newErrors.bondSize = 'Bond size must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FactoryRegistrationData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        factoryLicense: file,
      }))
      setLicenseFileName(file.name)
      // Clear error for this field
      if (errors.factoryLicense) {
        setErrors((prev) => ({
          ...prev,
          factoryLicense: undefined,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    setIsSubmitting(true)

    try {
      // Store file and registration data in localStorage if present - wait for it to complete
      if (formData.factoryLicense) {
        const file = formData.factoryLicense
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            try {
              const fileData = {
                name: file.name,
                type: file.type,
                data: event.target?.result,
              }
              localStorage.setItem('factoryLicenseFile', JSON.stringify(fileData))
              
              // Also store registration data
              const registrationData = {
                factoryName: formData.factoryName,
                ownerName: formData.ownerName,
                location: formData.location,
                bondSize: formData.bondSize,
                licenseFileName: file.name,
                timestamp: new Date().toISOString(),
              }
              localStorage.setItem('factoryRegistrationData', JSON.stringify(registrationData))
              resolve()
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      // Save factory registration data
      const response = await fetch('/api/factory-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryName: formData.factoryName,
          ownerName: formData.ownerName,
          location: formData.location,
          bondSize: formData.bondSize,
          licenseFileName: formData.factoryLicense?.name || 'license_file',
          userId: 'current-user',
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to register factory'
        try {
          const errorData = await response.json()
          console.error('API Error Response:', errorData)
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch (e) {
          console.error('Could not parse error response:', e)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      toast.success('Factory registered successfully!')
      onSuccess?.(formData)
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to register factory. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Factory Registration</CardTitle>
          <CardDescription className="text-xs">
            Complete your factory information to get started with Pollu-Stake
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Factory Name */}
            <div>
              <label htmlFor="factoryName" className="block text-xs font-medium text-charcoal-900 mb-1">
                Factory Name *
              </label>
              <Input
                id="factoryName"
                name="factoryName"
                type="text"
                placeholder="Enter factory name"
                value={formData.factoryName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`text-sm ${errors.factoryName ? 'border-red-500' : ''}`}
              />
              {errors.factoryName && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.factoryName}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label htmlFor="ownerName" className="block text-xs font-medium text-charcoal-900 mb-1">
                Owner Name *
              </label>
              <Input
                id="ownerName"
                name="ownerName"
                type="text"
                placeholder="Enter owner name"
                value={formData.ownerName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`text-sm ${errors.ownerName ? 'border-red-500' : ''}`}
              />
              {errors.ownerName && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.ownerName}
                </p>
              )}
            </div>

            {/* Factory License - File Upload */}
            <div>
              <label htmlFor="factoryLicense" className="block text-xs font-medium text-charcoal-900 mb-1">
                Factory License (PDF/Image) *
              </label>
              <div className={`relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition ${errors.factoryLicense ? 'border-red-500 bg-red-50' : 'border-charcoal-300 hover:border-primary-500'}`}>
                <input
                  id="factoryLicense"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <label htmlFor="factoryLicense" className="cursor-pointer block">
                  <Upload className="h-4 w-4 mx-auto mb-1 text-charcoal-500" />
                  <p className="text-xs text-charcoal-600">
                    {licenseFileName || 'Click to upload license'}
                  </p>
                </label>
              </div>
              {errors.factoryLicense && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.factoryLicense}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-medium text-charcoal-900 mb-1">
                Location *
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Enter factory location (city, state)"
                value={formData.location}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`text-sm ${errors.location ? 'border-red-500' : ''}`}
              />
              {errors.location && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Bond Size */}
            <div>
              <label htmlFor="bondSize" className="block text-xs font-medium text-charcoal-900 mb-1">
                Size of Bond (Number) *
              </label>
              <Input
                id="bondSize"
                name="bondSize"
                type="number"
                placeholder="Enter bond size"
                step="1"
                min="0"
                value={formData.bondSize}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`text-sm ${errors.bondSize ? 'border-red-500' : ''}`}
              />
              {errors.bondSize && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.bondSize}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-teal-50 p-2 border border-teal-200 mt-2">
              <p className="text-xs text-teal-800">
                <CheckCircle2 className="inline h-3 w-3 mr-1 text-teal-600" />
                Your factory information will be securely stored and used to create your License NFT.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-sm"
                size="sm"
              >
                {isSubmitting ? 'Registering...' : 'Complete'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 text-sm"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
