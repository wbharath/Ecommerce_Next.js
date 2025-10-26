'use server'

import db from '@/utils/db'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  imageSchema,
  productSchema,
  reviewSchema,
  validateWithZodSchema
} from './schemas'
import { deleteImg, uploadImage } from './supabase'
import { revalidatePath } from 'next/cache'

const getAuthUser = async () => {
  const user = await currentUser()
  if (!user) redirect('/')
  return user
}

const getAdminUser = async () => {
  const user = await getAuthUser()
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/')
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
    const file = formData.get('image') as File
    // const validatedFields = productSchema.parse(rawData)
    const validatedFields = validateWithZodSchema(productSchema, rawData)
    const validatedFile = validateWithZodSchema(imageSchema, { image: file })
    const fullPath = await uploadImage(validatedFile.image)

    await db.product.create({
      data: {
        ...validatedFields,
        image: fullPath,
        clerkId: user.id
      }
    })
  } catch (error) {
    return handleError(error)
  }
  redirect('/admin/products')
}

export const fetchAdminProducts = async () => {
  await getAdminUser()
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
  return products
}

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState
  await getAdminUser()
  try {
    const product = await db.product.delete({
      where: {
        id: productId
      }
    })
    await deleteImg(product.image)
    revalidatePath('/admin/products')
    return { message: 'product removed' }
  } catch (error) {
    return handleError(error)
  }
}

export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser()
  const product = await db.product.findUnique({
    where: {
      id: productId
    }
  })
  if (!product) redirect('/admin/products')
  return product
}

export const updateProductAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser()
  try {
    const productId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(productSchema, rawData)
    await db.product.update({
      where: {
        id: productId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`/admin/products/${productId}/edit`)
    return { message: 'Product updated successfully' }
  } catch (error) {
    return handleError(error)
  }
}

export const updateProductImageAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser()
  try {
    const image = formData.get('image') as File
    const productId = formData.get('id') as string
    const oldImageUrl = formData.get('url') as string

    // console.log('=== UPDATE IMAGE DEBUG ===')
    // console.log('Product ID:', productId)
    // console.log('Old Image URL:', oldImageUrl)
    // console.log('New Image File:', {
    //   name: image.name,
    //   size: image.size,
    //   type: image.type
    // })

    // Validate file
    const validatedFile = validateWithZodSchema(imageSchema, { image })
    // console.log('File validated successfully')

    // Upload new image
    // console.log('Starting upload...')
    const fullPath = await uploadImage(validatedFile.image)
    // console.log('Upload successful! New path:', fullPath)

    // Delete old image
    // console.log('Deleting old image...')
    await deleteImg(oldImageUrl)
    // console.log('Old image deleted')

    // Update database
    // console.log('Updating database...')
    await db.product.update({
      where: {
        id: productId
      },
      data: {
        image: fullPath
      }
    })
    // console.log('Database updated!')

    // revalidatePath('/products')
    // revalidatePath(`/products/${productId}`)
    // revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}/edit`)

    return { message: 'Product Image updated successfully' }
  } catch (error) {
    console.error('=== ERROR IN UPDATE IMAGE ===')
    // console.error(error)
    return handleError(error)
  }
}

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const user = await getAuthUser()
  const favorite = await db.favorite.findFirst({
    where: {
      productId,
      clerkId: user.id
    },
    select: {
      id: true
    }
  })
  return favorite?.id || null
}

export const toggleFavoriteAction = async (prevState: {
  productId: string
  favoriteId: string | null
  pathname: string
}) => {
  const user = await getAuthUser()
  const { productId, favoriteId, pathname } = prevState
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId
        }
      })
    } else {
      await db.favorite.create({
        data: {
          productId,
          clerkId: user.id
        }
      })
    }
    revalidatePath(pathname)
    return { message: favoriteId ? 'removed from faves' : 'added to faves' }
  } catch (error) {
    return handleError(error)
  }
}

export const fetchUserFavorites = async () => {
  const user = await getAuthUser()
  const favorites = await db.favorite.findMany({
    where: {
      clerkId: user.id
    },
    include: {
      product: true
    }
  })
  return favorites
}

export const createReviewAction = async (
  prevState: any,
  formData: FormData
) => {
  const user = await getAuthUser()
  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(reviewSchema, rawData)
    await db.review.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    revalidatePath(`/products/${validatedFields.productId}`)

    return { message: 'review submitted successfully' }
  } catch (error) {
    return handleError(error)
  }
}

export const fetchProductsReviews = async (productId: string) => {
  const reviews = await db.review.findMany({
    where: {
      productId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return reviews
}
export const fetchProductRating = async (productId: string) => {
  const result = await db.review.groupBy({
    by: ['productId'],
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    },
    where: {
      productId
    }
  })
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0
  }
}
export const fetchProductsReviewsByUser = async () => {
  const user = await getAuthUser()
  const reviews = await db.review.findMany({
    where: {
      clerkId: user.id
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      product: {
        select: {
          image: true,
          name: true
        }
      }
    }
  })
  return reviews
}
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState
  const user = await getAuthUser()
  try {
    await db.review.delete({
      where: {
        id: reviewId,
        clerkId: user.id
      }
    })
    revalidatePath('/reviews')
    return { message: 'review deleted successfully' }
  } catch (error) {
    return handleError(error)
  }
}
export const findExistingReview = async (userId: string, productId: string) => {
  return db.review.findFirst({
    where: {
      clerkId: userId,
      productId
    }
  })
}

export const fetchCartItems = async () => {
  const { userId } = auth()
  const cart = await db.cart.findFirst({
    where: {
      clerkId: userId ?? ''
    },
    select: {
      numItemsInCart: true
    }
  })
  return cart?.numItemsInCart || 0
}

const fetchProduct = async () => {}

export const fetchOrCreateCart = async () => {}

const updateOrCreateCartItem = async () => {}

export const updateCart = async () => {}

export const addToCartAction = async () => {}

export const removeCartItemAction = async () => {}

export const updateCartItemAction = async () => {}
