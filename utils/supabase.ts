import { createClient } from '@supabase/supabase-js'

const bucket = 'main-bucket'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)
console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const uploadImage = async (image: File) => {
  const timestamp = Date.now()
  const newName = `${timestamp}-${image.name}`
  console.log('Uploading to bucket:', bucket)
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: '3600' })
  console.log('Upload result - data:', data, 'error:', error)
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Image upload failed')
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl
}

export const deleteImg = (url: string) => {
  const imageName = url.split('/').pop()
  console.log(imageName)
  if (!imageName) throw new Error('Invalid URL')
  return supabase.storage.from(bucket).remove([imageName])
}
