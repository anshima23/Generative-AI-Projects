export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  humidity: string;
  description: string;
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "default_key";
  
  try {
    // If location is "current location", we'll use a default city
    const queryLocation = location === "current location" ? "New York" : location;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(queryLocation)}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      location: data.name,
      temperature: `${Math.round(data.main.temp)}°C`,
      condition: data.weather[0].main,
      humidity: `${data.main.humidity}%`,
      description: data.weather[0].description
    };
  } catch (error) {
    console.error("Weather API error:", error);
    
    // Fallback weather data if API fails
    return {
      location: location || "Unknown",
      temperature: "22°C",
      condition: "Clear",
      humidity: "60%",
      description: "Weather data unavailable"
    };
  }
}
