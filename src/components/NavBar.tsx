import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Compass, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function NavBar() {
  const { session, user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsRecruiter(false);
      return;
    }
    supabase
      .from('candidates')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsRecruiter(data?.role === 'recruiter');
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setLocation('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center mx-auto px-4 md:px-8 max-w-7xl justify-between">
        
        <div className="flex items-center">
          <Link href={session ? "/offers" : "/"} className="flex items-center space-x-2 group" data-testid="link-home">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Talent-DZ
            </span>
          </Link>
          
          {session && (
            <nav className="hidden md:flex items-center ml-10 space-x-6 text-sm font-medium">
              <Link href="/offers" className="transition-colors hover:text-primary text-muted-foreground hover:bg-muted/50 px-3 py-2 rounded-md" data-testid="link-offers">
                Discover Offers
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-primary text-muted-foreground hover:bg-muted/50 px-3 py-2 rounded-md" data-testid="link-dashboard">
                My Workspace
              </Link>
              {isRecruiter && (
                <Link href="/candidatures" className="transition-colors hover:text-primary text-muted-foreground hover:bg-muted/50 px-3 py-2 rounded-md" data-testid="link-candidatures">
                  Candidatures
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium" onClick={handleSignOut} data-testid="button-signout">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login" data-testid="link-nav-login">
                <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">Log In</Button>
              </Link>
              <Link href="/auth/signup" data-testid="link-nav-signup">
                <Button className="font-medium shadow-sm hover:-translate-y-0.5 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] pt-12">
                <div className="flex flex-col space-y-6">
                  {session ? (
                    <>
                      <Link href="/offers" className="text-lg font-medium hover:text-primary transition-colors">
                        Discover Offers
                      </Link>
                      <Link href="/dashboard" className="text-lg font-medium hover:text-primary transition-colors">
                        My Workspace
                      </Link>
                      {isRecruiter && (
                        <Link href="/candidatures" className="text-lg font-medium hover:text-primary transition-colors">
                          Candidatures
                        </Link>
                      )}
                      <hr className="border-border" />
                      <Button variant="ghost" className="justify-start px-0 text-muted-foreground" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="text-lg font-medium hover:text-primary transition-colors">
                        Log In
                      </Link>
                      <Link href="/auth/signup" className="text-lg font-medium hover:text-primary transition-colors">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
    </nav>
  );
}
