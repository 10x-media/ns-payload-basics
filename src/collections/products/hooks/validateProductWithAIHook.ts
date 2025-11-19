import OpenAI from 'openai'
import type { Product } from '@/payload-types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Toggle image validation on/off via environment variable
// Set ENABLE_IMAGE_VALIDATION=true to enable image checking, false or unset to disable
const ENABLE_IMAGE_VALIDATION = process.env.ENABLE_IMAGE_VALIDATION === 'true'

type ProductWithValidation = Product & {
  validationStatus?: 'blocked' | 'checked' | 'needs human validation'
}

export async function validateProductWithAIHook({
  data,
  req,
  operation,
}: {
  data: any
  req: any
  operation: 'create' | 'update'
}): Promise<any> {
  // Skip AI validation if manually verified is enabled
  if (data.manuallyVerified === true) {
    // If manually verified, respect the manually set validationStatus and don't override it
    return data
  }

  // For updates, check if the product was previously manually verified
  let originalDoc: (ProductWithValidation & { manuallyVerified?: boolean }) | null = null
  if (operation === 'update' && data.id) {
    try {
      originalDoc = (await req.payload.findByID({
        collection: 'products',
        id: data.id,
      })) as ProductWithValidation & { manuallyVerified?: boolean }

      // If it was manually verified before, don't override unless manuallyVerified is explicitly set to false
      if (originalDoc.manuallyVerified === true && data.manuallyVerified !== false) {
        return data
      }
    } catch (error) {
      console.error('Error fetching original document:', error)
    }
  }

  // Skip validation if validationStatus is already set and we're not updating relevant fields
  // This prevents re-validation on every update
  if (operation === 'update' && data.id && data.validationStatus && originalDoc) {
    // Only re-validate if name, description, or (if image validation enabled) image changed
    const relevantFieldsChanged =
      originalDoc.name !== data.name ||
      originalDoc.description !== data.description ||
      (ENABLE_IMAGE_VALIDATION && originalDoc.image !== data.image)

    if (!relevantFieldsChanged) {
      return data
    }
  }

  // Get image URL if image exists and image validation is enabled
  let imageUrl: string | null = null
  if (ENABLE_IMAGE_VALIDATION && data.image) {
    const imageId = typeof data.image === 'string' ? data.image : data.image.id
    if (imageId) {
      try {
        const imageDoc = await req.payload.findByID({
          collection: 'product-images',
          id: imageId,
        })
        imageUrl = imageDoc?.url || null
      } catch (error) {
        console.error('Error fetching product image:', error)
      }
    }
  }

  // Prepare product information for AI
  const productInfo = {
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
  }

  // Call OpenAI API for validation
  let validationStatus: 'blocked' | 'checked' | 'needs human validation' = 'needs human validation'

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, defaulting to "needs human validation"')
      return {
        ...data,
        validationStatus: 'needs human validation',
      }
    }

    const systemMessage = ENABLE_IMAGE_VALIDATION
      ? `You are a product validation system. Analyze product information and images to determine if they should be:
- "blocked": Product violates policies (inappropriate content, prohibited items, etc.)
- "checked": Product is safe and appropriate for marketplace.
- "needs human validation": Product requires manual review (unclear, edge cases, etc.)

Respond with ONLY one of these three exact strings: "blocked", "checked", or "needs human validation"`
      : `You are a product validation system. Analyze product information (text only, no images) to determine if they should be:
- "blocked": Product violates policies (inappropriate content, prohibited items, etc.)
- "checked": Product is safe and appropriate for marketplace.
- "needs human validation": Product requires manual review (unclear, edge cases, etc.)

Respond with ONLY one of these three exact strings: "blocked", "checked", or "needs human validation"`

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Validate this product:
Name: ${productInfo.name}
Description: ${productInfo.description || 'No description'}
Price: $${productInfo.price}

Please analyze this product and respond with only one of: "blocked", "checked", or "needs human validation"`,
          },
          // Only include image if image validation is enabled and image URL exists
          ...(ENABLE_IMAGE_VALIDATION && imageUrl
            ? [
                {
                  type: 'image_url' as const,
                  image_url: {
                    url: imageUrl,
                  },
                },
              ]
            : []),
        ],
      },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 10,
      temperature: 0,
    })

    const response = completion.choices[0]?.message?.content?.trim().toLowerCase()

    console.log(response)

    if (response === 'blocked' || response === 'checked' || response === 'needs human validation') {
      validationStatus = response
    } else {
      // If response doesn't match expected values, default to needs human validation
      console.warn(`Unexpected AI response: ${response}, defaulting to "needs human validation"`)
      validationStatus = 'needs human validation'
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    // On error, default to needs human validation
    validationStatus = 'needs human validation'
  }

  return {
    ...data,
    validationStatus,
  }
}
