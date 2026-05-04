import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { JobOffer } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, MapPin, ArrowLeft, UploadCloud, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Apply() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('job_offers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOffer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload your CV in PDF format only.');
        setFile(null);
      } else if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !offer) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Upload CV to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, file, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      // 3. Create Application record
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          candidate_id: user.id,
          job_offer_id: offer.id,
          cv_url: publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Your application has been sent successfully!', {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      });
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 animate-pulse">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium">Preparing application...</p>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertDescription className="font-medium text-lg">{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-8 h-12 px-6" onClick={() => setLocation('/offers')}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Return to Offers
        </Button>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="min-h-screen bg-muted/10 py-8 md:py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground font-medium group" onClick={() => setLocation('/offers')}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to all offers
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8 animate-slide-up-fade">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <div className="h-2 bg-primary w-full"></div>
              <CardHeader className="pb-6 px-6 pt-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <CardTitle className="text-3xl font-display font-bold mb-3 leading-tight">{offer.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-base">
                      <span className="flex items-center text-foreground font-semibold">
                        <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                        {offer.company}
                      </span>
                      <span className="flex items-center text-muted-foreground font-medium">
                        <MapPin className="h-5 w-5 mr-2" />
                        {offer.location || 'Remote'}
                      </span>
                    </div>
                  </div>
                  {offer.contract_type && (
                    <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shrink-0">
                      {offer.contract_type}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <div className="h-px w-full bg-border/50 mb-6"></div>
                <h3 className="font-display font-bold text-xl mb-4">About the role</h3>
                <div className="prose max-w-none text-muted-foreground leading-relaxed">
                  {offer.description ? (
                    offer.description.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <p className="italic">No detailed description available.</p>
                  )}
                </div>
                {offer.salary_range && (
                  <div className="mt-8 bg-muted rounded-xl p-4 inline-block border border-border/50">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Salary Indication</p>
                    <p className="font-semibold text-foreground text-lg">{offer.salary_range}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-md shadow-primary/5">
              <CardHeader className="bg-muted/30 border-b border-border/50 px-6 py-5">
                <CardTitle className="flex items-center text-xl font-display">
                  <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                  Submit Your Application
                </CardTitle>
                <CardDescription className="text-base mt-1">We'll send this directly to {offer.company}.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 p-6">
                  {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-3">
                    <Label htmlFor="cv-upload" className="text-base font-semibold">Your Resume / CV</Label>
                    <p className="text-sm text-muted-foreground mb-4">Please upload a PDF file (max 5MB).</p>
                    
                    <div className="relative group">
                      <input
                        id="cv-upload"
                        type="file"
                        accept="application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        data-testid="input-cv"
                      />
                      <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-200 
                        ${file ? 'bg-primary/5 border-primary bg-pattern-sand' : 'bg-muted/30 border-border/80 group-hover:bg-muted/60 group-hover:border-primary/50'}`}>
                        
                        {file ? (
                          <>
                            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                              <FileText className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-semibold text-foreground text-center px-4 truncate w-full max-w-xs">{file.name}</p>
                            <p className="text-sm text-primary font-medium mt-2">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <div className="h-16 w-16 bg-background rounded-full shadow-sm border border-border/50 flex items-center justify-center mb-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
                              <UploadCloud className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium text-foreground mb-1">Click or drag file to upload</p>
                            <p className="text-sm text-muted-foreground">PDF format only</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 border-t border-border/50 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Your data is secure and will only be shared with the employer.
                  </p>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 bg-primary text-primary-foreground ml-auto" 
                    disabled={submitting || !file}
                    data-testid="button-submit-application"
                  >
                    {submitting ? 'Sending Application...' : 'Submit Application'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          <div className="md:col-span-1 animate-slide-up-fade [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
            <Card className="sticky top-24 border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-display">Why Talent-DZ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
                  <p><strong className="text-foreground">Direct connection.</strong> Your application goes straight to the hiring manager.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
                  <p><strong className="text-foreground">Verified roles.</strong> We ensure companies are actively hiring for these positions.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
                  <p><strong className="text-foreground">Track progress.</strong> Monitor the status of your application from your dashboard.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
