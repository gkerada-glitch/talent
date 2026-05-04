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

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Signup() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setLocation('/offers');
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Decorative Side */}
      <div className="hidden lg:flex w-1/2 bg-muted/30 relative items-center justify-center overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg p-12">
          <h2 className="text-4xl font-display font-bold mb-6 tracking-tight text-foreground">Start something new.</h2>
          <p className="text-muted-foreground text-xl leading-relaxed mb-8">
            Create an account to access premium opportunities, track your applications, and put your career on the fast track.
          </p>
          <div className="space-y-4">
            {[
              "Apply to top local companies in one click",
              "Track your application status in real-time",
              "Simple, clean, and respectful of your time"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto animate-slide-up-fade">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 text-muted-foreground hover:text-foreground transition-colors w-fit">
            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">Talent-DZ</span>
          </Link>
          
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8 text-lg">Join the network of ambitious professionals.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} data-testid="input-fullname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel className="text-foreground font-medium">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 text-base shadow-md shadow-primary/10 mt-4 group" disabled={form.formState.isSubmitting} data-testid="button-submit">
                {form.formState.isSubmitting ? 'Creating account...' : (
                  <span className="flex items-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors" data-testid="link-login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
