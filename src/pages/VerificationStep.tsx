import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VerificationChoice } from '@/components/auth/VerificationChoice';

const VerificationStep: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const nextUrl = searchParams.get('next') || '/profile';

  const handleVerificationComplete = () => {
    navigate(nextUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Vérification</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 pt-8">
        <VerificationChoice
          userEmail={email}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    </div>
  );
};

export default VerificationStep;