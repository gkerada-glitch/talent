import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Application, JobOffer } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, MapPin, BriefcaseBusiness, Clock, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

type ApplicationWithOffer = Application & { job_offers: JobOffer };

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, job_offers(title, company, location, contract_type)')
          .eq('candidate_id', user.id)
          .order('applied_at', { ascending: false });

        if (error) throw error;
        setApplications(data as unknown as ApplicationWithOffer[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent gap-1.5 px-3 py-1 font-medium">
            <Clock className="h-3.5 w-3.5" /> Pending Review
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent gap-1.5 px-3 py-1 font-medium">
            <BriefcaseBusiness className="h-3.5 w-3.5" /> Under Review
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent gap-1.5 px-3 py-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-transparent gap-1.5 px-3 py-1 font-medium">
            <XCircle className="h-3.5 w-3.5" /> Declined
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="px-3 py-1">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 animate-pulse">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-primary-foreground py-12 px-4 border-b border-primary-foreground/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-sand.png')] bg-cover opacity-10 mix-blend-multiply pointer-events-none" />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">My Workspace</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">Track your applications and manage your career journey in one place.</p>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 -mt-8 relative z-20">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, color: 'text-foreground' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Under Review', value: stats.reviewed, color: 'text-blue-600' },
            { label: 'Accepted', value: stats.accepted, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <Card key={i} className="border-border/60 shadow-sm animate-slide-up-fade opacity-0 [animation-fill-mode:forwards]" style={{animationDelay: `${i * 100}ms`}}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-6 font-medium">
            Could not load applications: {error}
          </div>
        )}

        {applications.length === 0 && !error ? (
          <Card className="border-dashed border-2 bg-background shadow-sm animate-slide-up-fade [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary">
                <BriefcaseBusiness className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Your workspace is empty</h3>
              <p className="text-muted-foreground max-w-md text-lg mb-8">
                You haven't applied to any positions yet. Discover roles that match your ambition.
              </p>
              <Link href="/offers">
                <Button size="lg" className="h-14 px-8 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all text-base">
                  Browse Open Positions <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold mb-4 mt-8">Recent Applications</h2>
            {applications.map((app, i) => (
              <Card key={app.id} className="overflow-hidden group hover:shadow-md transition-all border-border/60 animate-slide-up-fade opacity-0 [animation-fill-mode:forwards]" style={{animationDelay: `${i * 100 + 400}ms`}}>
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{app.job_offers.title}</h3>
                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-base font-medium">
                          <span className="flex items-center text-muted-foreground">
                            <Building2 className="h-4 w-4 mr-2" />
                            {app.job_offers.company}
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {app.job_offers.location || 'Remote'}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(app.status)}</div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-md mt-4">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Applied on {format(new Date(app.applied_at), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 p-6 md:w-56 flex md:flex-col items-center md:justify-center border-t md:border-t-0 md:border-l border-border/50 gap-4">
                    {app.cv_url ? (
                      <Button variant="outline" className="w-full h-12 bg-background hover:bg-primary/5 hover:text-primary border-border/60 hover:border-primary/30 transition-colors" asChild>
                        <a href={app.cv_url} target="_blank" rel="noopener noreferrer" data-testid={`link-view-cv-${app.id}`}>
                          <FileText className="h-4 w-4 mr-2" /> View Submitted CV
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center">No CV attached</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
