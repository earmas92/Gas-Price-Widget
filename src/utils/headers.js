export function createHeaders() {
  const headers = new Headers();
  
  // Required headers for GasBuddy API
  headers.append("authority", "www.gasbuddy.com");
  headers.append("accept", "*/*");
  headers.append("accept-language", "en-US,en;q=0.9");
  headers.append("apollo-require-preflight", "true");
  headers.append("content-type", "application/json");
  headers.append("gbcsrf", process.env.GASBUDDY_CSRF_TOKEN || "1.ZZjgVN9S4RtbF6zO");
  headers.append("origin", "https://www.gasbuddy.com");
  headers.append("referer", process.env.GASBUDDY_REFERER || "https://www.gasbuddy.com/home");
  
  // Browser-like headers
  headers.append("sec-ch-ua", '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
  headers.append("sec-ch-ua-mobile", "?0");
  headers.append("sec-ch-ua-platform", '"Linux"');
  headers.append("sec-fetch-dest", "empty");
  headers.append("sec-fetch-mode", "cors");
  headers.append("sec-fetch-site", "same-origin");
  headers.append("user-agent", process.env.USER_AGENT || "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  return headers;
}