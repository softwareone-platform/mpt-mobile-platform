/**
 * Formats seconds into a timer string (M:SS format)
 * @param seconds - The number of seconds to format
 * @returns Formatted timer string (e.g., "1:30", "0:05")
 */
export const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
