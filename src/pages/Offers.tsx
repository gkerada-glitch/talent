import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { JobOffer } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Building2, Calendar, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Offers() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('job_offers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOffers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const contractTypes = useMemo(() => {
    const types = new Set(offers.map(o => o.contract_type).filter(Boolean));
    return Array.from(types) as string[];
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = 
        offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        offer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType ? offer.contract_type === selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [offers, searchQuery, selectedType]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 animate-pulse">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium">Finding the best opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 flex flex-col items-center text-center">
          <p className="font-semibold text-lg mb-2">We couldn't load the offers right now.</p>
          <p className="opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header / Search Section */}
      <div className="bg-background border-b border-border/40 sticky top-16 z-30 shadow-sm">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2 text-foreground">Discover Opportunities</h1>
              <p className="text-muted-foreground text-lg">Find the role that matches your ambition.</p>
            </div>
            <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full w-fit">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'} available
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by job title, company, or city..." 
                className="pl-11 h-12 text-base bg-muted/50 border-transparent focus:bg-background transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Button 
                variant={selectedType === null ? "default" : "outline"} 
                className={`shrink-0 h-12 rounded-full ${selectedType === null ? 'shadow-md shadow-primary/20' : 'bg-background hover:bg-muted'}`}
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Button>
              {contractTypes.map(type => (
                <Button 
                  key={type}
                  variant={selectedType === type ? "default" : "outline"} 
                  className={`shrink-0 h-12 rounded-full ${selectedType === type ? 'shadow-md shadow-primary/20' : 'bg-background hover:bg-muted'}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-background rounded-3xl border border-border/50 shadow-sm animate-slide-up-fade">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No matches found</h3>
            <p className="text-muted-foreground max-w-md text-lg">We couldn't find any offers matching your criteria. Try adjusting your filters or search terms.</p>
            <Button variant="outline" className="mt-8 h-12 px-6" onClick={() => { setSearchQuery(''); setSelectedType(null); }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, i) => (
              <Card 
                key={offer.id} 
                className="group flex flex-col bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-slide-up-fade opacity-0 [animation-fill-mode:forwards]"
                style={{animationDelay: `${Math.min(i * 50, 500)}ms`}}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-primary/10 text-primary border-transparent hover:bg-primary/20 font-medium">
                      {offer.contract_type || 'N/A'}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center bg-muted px-2 py-1 rounded-md">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-display leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={offer.title}>
                    {offer.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-2 mt-3">
                    <span className="flex items-center text-foreground font-medium text-base">
                      <Building2 className="h-4.5 w-4.5 mr-2 text-muted-foreground" />
                      {offer.company}
                    </span>
                    <span className="flex items-center text-sm">
                      <MapPin className="h-4.5 w-4.5 mr-2 text-muted-foreground" />
                      {offer.location || 'Remote / Unspecified'}
                    </span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 pb-6">
                  <div className="relative">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {offer.description || 'No description provided.'}
                    </p>
                    {/* Fade out text if long */}
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  </div>
                  
                  {offer.salary_range && (
                    <div className="mt-4 inline-flex items-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-md text-sm font-semibold">
                      {offer.salary_range}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0 pb-6 px-6 mt-auto">
                  <Link href={`/offers/${offer.id}/apply`} className="w-full">
                    <Button 
                      className="w-full h-12 font-medium shadow-sm hover:-translate-y-0.5 transition-transform group-hover:bg-primary group-hover:text-primary-foreground text-foreground bg-muted hover:bg-muted/80" 
                      data-testid={`button-apply-${offer.id}`}
                    >
                      View Details & Apply
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
