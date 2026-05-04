import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Calendar,
  Mail,
  User as UserIcon,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

type RecruiterApplication = {
  id: string;
  status: ApplicationStatus;
  cv_url: string | null;
  applied_at: string;
  job_offers: {
    title: string;
    company: string;
  } | null;
  candidates: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const STATUS_OPTIONS: ApplicationStatus[] = ['pending', 'reviewed', 'accepted', 'rejected'];

function getStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent gap-1.5 px-3 py-1 font-medium">
          <Clock className="h-3.5 w-3.5" /> Pending
        </Badge>
      );
    case 'reviewed':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent gap-1.5 px-3 py-1 font-medium">
          <BriefcaseBusiness className="h-3.5 w-3.5" /> Reviewed
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
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </Badge>
      );
  }
}

export default function Candidatures() {
  const { user } = useAuth();
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Resolve current user's role
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('candidates')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        setError(error.message);
      }
      setRole((data?.role as 'candidate' | 'recruiter' | undefined) ?? 'candidate');
      setRoleLoading(false);
    };
    fetchRole();
  }, [user]);

  // 2. Once we know the user is a recruiter, fetch all applications
  useEffect(() => {
    if (role !== 'recruiter') return;

    const fetchApplications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*, job_offers(title, company), candidates(full_name, email)')
        .order('applied_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setApplications((data ?? []) as unknown as RecruiterApplication[]);
      }
      setLoading(false);
    };
    fetchApplications();
  }, [role]);

  const handleStatusChange = async (id: string, nextStatus: ApplicationStatus) => {
    setUpdatingId(id);
    const previous = applications;
    // Optimistic UI
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: nextStatus } : app)),
    );
    const { error } = await supabase
      .from('applications')
      .update({ status: nextStatus })
      .eq('id', id);
    setUpdatingId(null);
    if (error) {
      setApplications(previous);
      toast.error(`Could not update status: ${error.message}`);
      return;
    }
    toast.success(`Status updated to "${nextStatus}"`);
  };

  // ── Loading & guard states ──────────────────────────────────────────
  if (roleLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 animate-pulse">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium">Checking access…</p>
      </div>
    );
  }

  if (role !== 'recruiter') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-border/60">
          <CardContent className="flex flex-col items-center text-center py-12">
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Recruiters only</h2>
            <p className="text-muted-foreground">
              This area is reserved for accounts with the recruiter role. If you should have access,
              please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Recruiter view ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-4 border-b border-primary-foreground/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-sand.png')] bg-cover opacity-10 mix-blend-multiply pointer-events-none" />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
            Candidatures
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Review every application submitted across all job offers and update their status.
          </p>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 -mt-8 relative z-20">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-6 font-medium">
            Could not load data: {error}
          </div>
        )}

        {loading ? (
          <Card className="border-border/60 bg-background shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative w-12 h-12 mb-3">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground font-medium">Loading applications…</p>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card className="border-dashed border-2 bg-background shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">No applications yet</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                When candidates apply to your job offers, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold mb-4 mt-4">
              {applications.length} application{applications.length > 1 ? 's' : ''} received
            </h2>
            {applications.map((app, i) => (
              <Card
                key={app.id}
                className="overflow-hidden group hover:shadow-md transition-all border-border/60 animate-slide-up-fade opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`card-candidature-${app.id}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Main info */}
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
                          <UserIcon className="h-4 w-4" />
                          <span className="text-foreground font-display font-bold text-xl">
                            {app.candidates?.full_name || 'Unknown candidate'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {app.candidates?.email || '—'}
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(app.status)}</div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Applied for
                      </p>
                      <p className="font-display font-bold text-base text-foreground">
                        {app.job_offers?.title || 'Untitled role'}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Building2 className="h-4 w-4 mr-2" />
                        {app.job_offers?.company || '—'}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-md">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Applied on {format(new Date(app.applied_at), 'MMMM d, yyyy')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-muted/20 p-6 md:w-72 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-border/50">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                        Update status
                      </label>
                      <Select
                        value={app.status}
                        onValueChange={(value) =>
                          handleStatusChange(app.id, value as ApplicationStatus)
                        }
                        disabled={updatingId === app.id}
                      >
                        <SelectTrigger
                          className="w-full bg-background"
                          data-testid={`select-status-${app.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {app.cv_url ? (
                      <Button
                        variant="outline"
                        className="w-full h-11 bg-background hover:bg-primary/5 hover:text-primary border-border/60 hover:border-primary/30 transition-colors"
                        asChild
                      >
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`link-view-cv-${app.id}`}
                        >
                          <FileText className="h-4 w-4 mr-2" /> View CV
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-2">
                        No CV attached
                      </p>
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
