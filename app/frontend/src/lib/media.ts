export function isImageSource(value?: string | null) {
  return Boolean(value && (value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://")));
}

export function getYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2];
      return parsed.searchParams.get("v") ?? "";
    }
  } catch {
    return "";
  }
  return "";
}
