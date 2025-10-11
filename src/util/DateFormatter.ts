//chat list 
export function formatChatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return "Yesterday";
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

//individual message 
export function formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    if (isToday) return timeStr;
    if (isYesterday) return `Yesterday ${timeStr}`;
    return `${date.toLocaleDateString()} ${timeStr}`;
}

// grouping headers
export function formatMessageGroupDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

//Contact List
export const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return null;

    try {
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    } catch {
        return null;
    }
};

// Member Since (Profile Screen)
export function formatMemberSince(timestamp: string | Date): string {
    if (!timestamp) return 'Recently';

    try {
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            return 'Recently';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        console.error('Error formatting member since date:', error);
        return 'Recently';
    }
}

export function formatMemberSinceRelative(timestamp: string | Date): string {
    if (!timestamp) return 'Recently';

    try {
        const date = new Date(timestamp);
        const now = new Date();

        if (isNaN(date.getTime())) {
            return 'Recently';
        }

        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);

        if (diffDays < 1) {
            return 'Today';
        }

        if (diffDays < 7) {
            return 'This week';
        }
        if (diffDays < 30) {
            return 'This month';
        }

        if (diffMonths < 3) {
            return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        console.error('Error formatting member since date:', error);
        return 'Recently';
    }
}