'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/') // Redirect to home or dashboard after login
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`
        : '/auth/confirm',
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return redirect('/login?message=Could not authenticate user')
  }

  // For server-side auth, the user needs to confirm their email.
  // Optionally, redirect to a page informing them to check their email.
  return redirect('/login?message=Check email to continue sign in process')
}
