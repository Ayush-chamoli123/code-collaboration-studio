import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WANDBOX_API = "https://wandbox.org/api/compile.json";

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

    console.log("Submitting code to Wandbox...");

    const submitRes = await fetch(WANDBOX_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        compiler: "gcc-head",
        "compiler-option-raw": "-std=c++17\n-O2",
        stdin: stdin || "",
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Wandbox error:", errText);
      return new Response(
        JSON.stringify({ error: `Compilation service error: ${submitRes.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const result = await submitRes.json();
    console.log("Wandbox result status:", result.status);

    const compilerError = result.compiler_error || "";
    const compilerMessage = result.compiler_message || "";
    const programOutput = result.program_output || "";
    const programError = result.program_error || "";
    const status = result.status || "0";

    if (compilerError) {
      return new Response(
        JSON.stringify({
          compile_error: compilerError,
          status: "Compilation Error",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (status !== "0" && programError) {
      return new Response(
        JSON.stringify({
          compile_error: programError,
          status: "Runtime Error",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        output: programOutput || "(no output)",
        stderr: programError,
        status: status === "0" ? "Accepted" : `Exit code: ${status}`,
        compiler_message: compilerMessage,
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
