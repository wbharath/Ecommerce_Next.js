'use server'

import db from '@/utils/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { productSchema, validateWithZodSchema } from './schemas'

const getAuthUser = async () => {
  const user = await currentUser()
  if (!user) redirect('/')
  return user
}

const handleError = (error: unknown): { message: string } => {
  console.error(error)

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'Something went wrong' }
}

export const fetchFeaturedProducts = async () => {
  const products = await db.product.findMany({
    where: {
      featured: true
    }
  })
  return products
}

export const fetchAllProducts = async ({ search = '' }: { search: string }) => {
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId
    }
  })
  if (!product) redirect('/products')
  return product
}

export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()
  try {
    const rawData = Object.fromEntries(formData)
    // const validatedFields = productSchema.parse(rawData)
    const validatedFields = validateWithZodSchema(productSchema, rawData)

    await db.product.create({
      data: {
        ...validatedFields,
        image: '/images/hero3.jpg',
        clerkId: user.id
      }
    })

    return { message: 'Product created successfully' }
  } catch (error) {
    return handleError(error)
  }
}
