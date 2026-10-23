import { useEffect } from 'react';

/**
 * Reusable SEO hook to update page title, meta descriptions, and Open Graph tags
 */
export const useSEO = ({
  title,
  description = 'Discover premium audio, computing gear, fashion, and lifestyle products at NovaShop with fast shipping and secure checkout.',
  image = '/logo.png',
  url = window.location.href,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const baseTitle = 'NovaShop | Modern E-Commerce Platform';
    document.title = title ? `${title} | NovaShop` : baseTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attribute, name, content) => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Standard & Open Graph meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title ? `${title} | NovaShop` : baseTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('name', 'twitter:title', title ? `${title} | NovaShop` : baseTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
  }, [title, description, image, url]);
};

export default useSEO;
