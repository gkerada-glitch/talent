import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Compass, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setLocation('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto animate-slide-up-fade">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 text-muted-foreground hover:text-foreground transition-colors w-fit">
            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">Talent-DZ</span>
          </Link>
          
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-lg">Sign in to continue your career journey.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex justify-between">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 text-base shadow-md shadow-primary/10 mt-4 group" disabled={form.formState.isSubmitting} data-testid="button-submit">
                {form.formState.isSubmitting ? 'Signing in...' : (
                  <span className="flex items-center">
                    Sign In <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors" data-testid="link-signup">
              Create an account
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Side */}
      <div className="hidden lg:flex w-1/2 bg-muted/30 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-sand.png')] bg-cover opacity-20 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg p-12 bg-background/40 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl shadow-black/5 mx-8">
          <h2 className="text-3xl font-display font-bold mb-4">"The right role changes everything."</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We built Talent-DZ to make finding your next career move as seamless as possible. No noise, just great opportunities across Algeria.
          </p>
        </div>
      </div>
    </div>
  );
}
