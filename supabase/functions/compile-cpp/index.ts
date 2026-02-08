import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, stdin } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: "No code provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const apiKey = Deno.env.get("JUDGE0_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Judge0 API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Submitting code to Judge0...");

    // Submit code - language_id 54 = C++ (GCC 9.2.0)
    const submitRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: 54,
        source_code: btoa(code),
        stdin: stdin ? btoa(stdin) : "",
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Judge0 error:", errText);
      return new Response(
        JSON.stringify({ error: `Compilation service error: ${submitRes.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const result = await submitRes.json();
    console.log("Judge0 result status:", result.status?.description);

    const decode = (s: string | null) => {
      if (!s) return "";
      try { return atob(s); } catch { return s; }
    };

    const output = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);
    const statusDesc = result.status?.description || "Unknown";

    if (result.status?.id >= 6) {
      // Compilation error or runtime error
      return new Response(
        JSON.stringify({
          compile_error: compileOutput || stderr || statusDesc,
          status: statusDesc,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        output: output || "(no output)",
        stderr,
        status: statusDesc,
        time: result.time,
        memory: result.memory,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Compile function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
