import { auth } from '../../../auth';
import { Button } from './ui/button';
import { signInAction, signOutAction } from '../actions/auth-actions';

/**
 * Server component — renders sign-in or user info + sign-out.
 */
export async function AuthHeader() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form action={signInAction}>
        <Button variant="outline" size="sm" className="rounded-xl font-bold" type="submit">
          Sign in
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt={session.user.name ?? 'User'}
          className="w-8 h-8 rounded-full border border-slate-200"
        />
      )}
      <span className="text-sm font-bold text-slate-700 hidden sm:block">
        {session.user.name}
      </span>
      <form action={signOutAction}>
        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
