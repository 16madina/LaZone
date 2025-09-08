import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface MapboxTokenModalProps {
  onTokenUpdate?: () => void;
}

const MapboxTokenModal = ({ onTokenUpdate }: MapboxTokenModalProps) => {
  const [token, setToken] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (!token.trim()) {
      toast.error("Veuillez entrer un token valide");
      return;
    }

    if (!token.startsWith('pk.')) {
      toast.error("Le token Mapbox doit commencer par 'pk.'");
      return;
    }

    localStorage.setItem('mapbox_token', token);
    toast.success("Token Mapbox sauvegardé avec succès!");
    setIsOpen(false);
    onTokenUpdate?.();
  };

  const currentToken = localStorage.getItem('mapbox_token');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Token Mapbox
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuration Token Mapbox</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="token">Token Public Mapbox</Label>
            <Input
              id="token"
              type="text"
              placeholder="pk.eyJ1Ijo..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Votre token public Mapbox (commence par 'pk.')
            </p>
          </div>
          
          {currentToken && (
            <div className="text-sm text-muted-foreground">
              <strong>Token actuel:</strong> {currentToken.substring(0, 20)}...
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Pour obtenir votre token Mapbox, visitez{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
              {' '}et accédez à la section Tokens de votre dashboard.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxTokenModal;