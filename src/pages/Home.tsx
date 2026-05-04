import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Globe, Building, Users } from 'lucide-react';

export default function Home() {
  const { session, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && session) {
      setLocation('/offers');
    }
  }, [session, loading, setLocation]);

  if (loading) return null; // Or a subtle loader if needed, but better to avoid flash if fast

  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden px-4">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="container max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <div className="flex flex-col gap-6 animate-slide-up-fade [animation-duration:800ms]">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The Next Generation of Algerian Talent
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight">
              Build your career.<br />
              <span className="text-primary relative inline-block">
                Right here.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-[500px] leading-relaxed">
              Connect with top companies across Algiers, Oran, Constantine, and beyond. Fast, direct, and built for ambitious professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/auth/signup" data-testid="link-hero-signup">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 bg-primary text-primary-foreground">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login" data-testid="link-hero-login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-border bg-background/50 hover:bg-muted transition-all">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative animate-slide-up-fade [animation-delay:200ms] [animation-duration:800ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 aspect-[4/3] md:aspect-[4/5] lg:aspect-square bg-muted">
              <img 
                src="/hero-algiers.png" 
                alt="Young professionals collaborating" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-background border border-border/50 rounded-xl p-5 shadow-xl animate-slide-up-fade [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">500+</p>
                  <p className="text-sm font-medium text-muted-foreground">Local Companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 bg-muted/30 border-y border-border/40 relative">
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up-fade">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Talent-DZ?</h2>
            <p className="text-muted-foreground text-lg">We stripped away the noise so you can focus on what matters: finding a role that values your skills.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8 text-primary" />,
                title: "Proudly Local",
                desc: "Roles across Algeria, vetted for quality. No ghost listings, no fake locations."
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-accent" />,
                title: "Direct Access",
                desc: "Apply with one click using your unified candidate profile. Track statuses in real-time."
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Human First",
                desc: "A platform designed to respect your time. Clean interfaces, fast loading, no endless forms."
              }
            ].map((prop, i) => (
              <div key={i} className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-shadow animate-slide-up-fade opacity-0 [animation-fill-mode:forwards]" style={{animationDelay: `${i * 150 + 200}ms`}}>
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-6">
                  {prop.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{prop.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/texture-sand.png')] bg-cover opacity-20 mix-blend-multiply pointer-events-none" />
        
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            Ready to make your move?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of professionals already using Talent-DZ to navigate their careers.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all bg-primary text-primary-foreground">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
      
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 bg-background">
        <p>© {new Date().getFullYear()} Talent-DZ. Designed for Algeria.</p>
      </footer>
    </div>
  );
}
