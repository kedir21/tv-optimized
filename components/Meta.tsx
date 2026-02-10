import React, { useEffect } from 'react';

interface MetaProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'video.movie' | 'video.tv_show';
}

const Meta: React.FC<MetaProps> = ({
    title,
    description,
    image,
    url,
    type = 'website'
}) => {
    const baseTitle = 'K-Flix Stream';
    const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | High-Quality Movies & TV Shows`;
    const defaultDesc = 'Stream the latest movies and TV shows in high quality for free on K-Flix.';

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Update Meta Description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description || defaultDesc);
        }

        // Update OG Tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', fullTitle);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description || defaultDesc);

        if (image) {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) ogImage.setAttribute('content', image);
        }

        if (url) {
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.setAttribute('content', url);
        }

        const ogType = document.querySelector('meta[property="og:type"]');
        if (ogType) ogType.setAttribute('content', type);

    }, [title, description, image, url, type]);

    return null;
};

export default Meta;
