/**
 * Production readiness checker for the real estate application
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProductionIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'images' | 'data' | 'performance' | 'security';
  message: string;
  listingId?: string;
  details?: any;
}

export const checkProductionReadiness = async (): Promise<ProductionIssue[]> => {
  const issues: ProductionIssue[] = [];

  try {
    // 1. Check for listings with placeholder images
    const { data: placeholderListings, error: placeholderError } = await supabase
      .from('listings')
      .select('id, title, images')
      .eq('status', 'active')
      .contains('images', ['/placeholder.svg']);

    if (placeholderError) {
      issues.push({
        type: 'critical',
        category: 'data',
        message: 'Failed to check placeholder images',
        details: placeholderError
      });
    } else if (placeholderListings && placeholderListings.length > 0) {
      placeholderListings.forEach(listing => {
        issues.push({
          type: 'critical',
          category: 'images',
          message: 'Listing has placeholder image instead of real photos',
          listingId: listing.id,
          details: { title: listing.title, images: listing.images }
        });
      });
    }

    // 2. Check for listings with no images
    const { data: noImageListings, error: noImageError } = await supabase
      .from('listings')
      .select('id, title, images')
      .eq('status', 'active')
      .or('images.is.null,images.eq.{}');

    if (noImageError) {
      issues.push({
        type: 'critical',
        category: 'data',
        message: 'Failed to check listings without images',
        details: noImageError
      });
    } else if (noImageListings && noImageListings.length > 0) {
      noImageListings.forEach(listing => {
        issues.push({
          type: 'critical',
          category: 'images',
          message: 'Listing has no images',
          listingId: listing.id,
          details: { title: listing.title }
        });
      });
    }

    // 3. Check for incomplete listings
    const { data: incompleteListings, error: incompleteError } = await supabase
      .from('listings')
      .select('id, title, description, price, address, city')
      .eq('status', 'active')
      .or('title.is.null,description.is.null,price.is.null,address.is.null,city.is.null');

    if (incompleteError) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: 'Failed to check incomplete listings',
        details: incompleteError
      });
    } else if (incompleteListings && incompleteListings.length > 0) {
      incompleteListings.forEach(listing => {
        const missing = [];
        if (!listing.title) missing.push('title');
        if (!listing.description) missing.push('description');
        if (!listing.price) missing.push('price');
        if (!listing.address) missing.push('address');
        if (!listing.city) missing.push('city');

        issues.push({
          type: 'warning',
          category: 'data',
          message: `Listing missing required fields: ${missing.join(', ')}`,
          listingId: listing.id,
          details: { title: listing.title, missing }
        });
      });
    }

    // 4. Check for broken Supabase image URLs
    const { data: allListings, error: allListingsError } = await supabase
      .from('listings')
      .select('id, title, images')
      .eq('status', 'active')
      .not('images', 'is', null);

    if (allListingsError) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: 'Failed to check image URLs',
        details: allListingsError
      });
    } else if (allListings) {
      for (const listing of allListings) {
        if (listing.images && Array.isArray(listing.images)) {
          const brokenImages = listing.images.filter(img => 
            typeof img === 'string' && 
            img.includes('supabase.co') && 
            !img.includes('/storage/v1/object/public/')
          );

          if (brokenImages.length > 0) {
            issues.push({
              type: 'critical',
              category: 'images',
              message: 'Listing has malformed Supabase image URLs',
              listingId: listing.id,
              details: { title: listing.title, brokenImages }
            });
          }
        }
      }
    }

  } catch (error) {
    issues.push({
      type: 'critical',
      category: 'security',
      message: 'Failed to perform production readiness check',
      details: error
    });
  }

  return issues;
};

export const formatProductionReport = (issues: ProductionIssue[]): string => {
  if (issues.length === 0) {
    return '✅ Application is production ready! No issues found.';
  }

  const critical = issues.filter(i => i.type === 'critical');
  const warnings = issues.filter(i => i.type === 'warning');
  const info = issues.filter(i => i.type === 'info');

  let report = `Production Readiness Report\n${'='.repeat(30)}\n\n`;
  
  if (critical.length > 0) {
    report += `🚨 CRITICAL ISSUES (${critical.length}):\n`;
    critical.forEach((issue, index) => {
      report += `${index + 1}. ${issue.message}`;
      if (issue.listingId) report += ` (ID: ${issue.listingId})`;
      report += '\n';
    });
    report += '\n';
  }

  if (warnings.length > 0) {
    report += `⚠️  WARNINGS (${warnings.length}):\n`;
    warnings.forEach((issue, index) => {
      report += `${index + 1}. ${issue.message}`;
      if (issue.listingId) report += ` (ID: ${issue.listingId})`;
      report += '\n';
    });
    report += '\n';
  }

  if (info.length > 0) {
    report += `ℹ️  INFO (${info.length}):\n`;
    info.forEach((issue, index) => {
      report += `${index + 1}. ${issue.message}`;
      if (issue.listingId) report += ` (ID: ${issue.listingId})`;
      report += '\n';
    });
  }

  return report;
};