import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  imageUrl: string;
  linkUrl?: string | null;
  title: string;
}

export const AdBanner = ({ imageUrl, linkUrl, title }: AdBannerProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (linkUrl) {
      // Ensure URL has protocol
      let url = linkUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="relative w-full rounded-xl overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      <div className="aspect-[3/1] relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Sponsored badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white rounded-full">
            Publicité
          </span>
        </div>

        {/* Link indicator */}
        {linkUrl && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full">
              <ExternalLink className="w-4 h-4 text-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
