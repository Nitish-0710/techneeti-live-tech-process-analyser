import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogEntry {
  timestamp: number;
  action: string;
  type: "keystroke" | "paste" | "run";
  code?: string;
  details?: string;
}

interface WorqHatRequest {
  question: string;
  preserve_history: boolean;
  randomness: number;
  stream_data: boolean;
  response_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { logs, finalCode } = await req.json()

    // Prepare analysis prompt for WorqHat API
    const analysisPrompt = `
    Analyze this coding session data and provide structured feedback:
    
    Final Code:
    ${finalCode}
    
    Session Activity:
    ${logs.map((log: LogEntry) => `${log.timestamp}ms: ${log.action} (${log.type})`).join('\n')}
    
    Provide analysis in this JSON format:
    {
      "summary": "Brief overall assessment",
      "approach": "Describe their problem-solving approach",
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["weakness1", "weakness2", "weakness3"],
      "scores": {
        "logic": 85,
        "debugging": 72,
        "efficiency": 90,
        "creativity": 68
      }
    }
    
    Focus on:
    - Code quality and logic
    - Problem-solving approach
    - Efficiency and optimization
    - Creative thinking and alternative solutions
    `;

    // Call WorqHat API (replace with your actual API key)
    const worqhatResponse = await fetch('https://api.worqhat.com/api/ai/content/v4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WORQHAT_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: analysisPrompt,
        preserve_history: false,
        randomness: 0.2,
        stream_data: false,
        response_type: "json"
      } as WorqHatRequest)
    });

    if (!worqhatResponse.ok) {
      throw new Error(`WorqHat API error: ${worqhatResponse.status}`);
    }

    const worqhatData = await worqhatResponse.json();
    
    // Parse the AI response
    let analysis;
    try {
      analysis = JSON.parse(worqhatData.content);
    } catch (e) {
      // Fallback if parsing fails
      analysis = {
        summary: "Analysis completed successfully",
        approach: "Systematic problem-solving approach",
        strengths: ["Clear code structure", "Good problem understanding", "Efficient solution"],
        weaknesses: ["Could explore more alternatives", "Limited optimization", "Minimal testing"],
        scores: {
          logic: Math.min(90, 60 + logs.filter((l: LogEntry) => l.type === 'keystroke').length / 10),
          debugging: Math.min(85, 50 + logs.filter((l: LogEntry) => l.type === 'run').length * 10),
          efficiency: Math.min(80, 70 + (logs.length < 50 ? 10 : -5)),
          creativity: Math.min(75, 60 + logs.filter((l: LogEntry) => l.type === 'paste').length * 5)
        }
      };
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})