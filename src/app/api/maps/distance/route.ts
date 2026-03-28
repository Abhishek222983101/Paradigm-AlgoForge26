import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origins, destinations } = body;

    if (!origins || !destinations || !Array.isArray(destinations)) {
      return NextResponse.json(
        { error: "origins and destinations array are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    const destStr = destinations.join("|");
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destStr)}&key=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google API error: ${data.status}`, details: data },
        { status: 400 }
      );
    }

    const results = data.rows[0]?.elements.map((element: any, index: number) => {
      if (element.status === "OK") {
        return {
          destination: destinations[index],
          distance: element.distance.text,
          distanceValue: element.distance.value,
          duration: element.duration.text,
          durationValue: element.duration.value,
          status: "OK"
        };
      }
      return {
        destination: destinations[index],
        distance: "N/A",
        distanceValue: -1,
        duration: "N/A",
        durationValue: -1,
        status: element.status
      };
    }) || [];

    return NextResponse.json({
      status: "OK",
      origin: data.origin_addresses[0],
      results
    });

  } catch (error) {
    console.error("Distance Matrix API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch distance matrix" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    endpoint: "/api/maps/distance",
    method: "POST",
    params: ["origins", "destinations (array)"]
  });
}
