/**
 * YouTube API utility functions
 */

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

/**
 * Fetch YouTube videos from the YouTube API
 */
export async function getYoutubeVideos(): Promise<YoutubeVideo[]> {
  // Simulate API call for now
  return [
    {
      id: "video1",
      title: "Introduction to Next.js",
      description: "Learn the basics of Next.js",
      thumbnail: "https://i.ytimg.com/vi/sample/default.jpg",
      publishedAt: new Date().toISOString(),
      channelTitle: "Tech Channel",
    },
    {
      id: "video2",
      title: "Docker for Beginners",
      description: "Docker containerization explained",
      thumbnail: "https://i.ytimg.com/vi/sample2/default.jpg",
      publishedAt: new Date().toISOString(),
      channelTitle: "DevOps Channel",
    },
  ];
}
