/**
 * Simpele HTML sanitizer voor AI-gegenereerde content.
 * Staat alleen veilige tags en attributen toe.
 * Verwijdert scripts, event handlers en andere XSS-vectoren.
 */

const ALLOWED_TAGS = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'span', 'div',
    'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'sup', 'sub',
]);

export function sanitizeHTML(html: string): string {
    // Verwijder <script> tags en content
    let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');

    // Verwijder <style> tags en content
    clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');

    // Verwijder event handlers (onclick, onerror, onload, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

    // Verwijder javascript: URLs
    clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    clean = clean.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');

    // Verwijder data: URLs (behalve data:image voor veilige afbeeldingen)
    clean = clean.replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, '');

    // Verwijder niet-toegestane tags maar behoud content
    clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
        const tagLower = tag.toLowerCase();
        if (ALLOWED_TAGS.has(tagLower)) {
            // Verwijder alle attributen behalve class en style (basic)
            if (match.startsWith('</')) return `</${tagLower}>`;
            // Strip all attributes for security
            return `<${tagLower}>`;
        }
        return ''; // Verwijder niet-toegestane tags
    });

    return clean;
}

/**
 * Converteer markdown-achtige tekst naar veilige HTML.
 * Gebruikt voor AI-gegenereerde analyses en uitleg.
 */
export function markdownToSafeHTML(text: string): string {
    let html = text
        // Headers
        .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
        .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n/g, '<br />');

    return sanitizeHTML(html);
}
