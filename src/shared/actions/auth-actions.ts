'use server';

import { signIn, signOut } from '../../../auth';

export async function signInAction() {
  await signIn(undefined, { redirectTo: '/' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

export async function signInWithCredentials(email: string, password: string) {
  await signIn('credentials', { email, password, redirectTo: '/' });
}
