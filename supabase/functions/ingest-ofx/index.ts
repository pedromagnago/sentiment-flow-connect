// Supabase Edge Function: ingest-ofx
// Parses OFX text and stores transactions with proper RLS
// Logs useful info and returns a summary

import { createClient } from "jsr:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal OFX parser extracting STMTTRN blocks
function parseOfx(ofxText: string) {
  // Normalize line breaks and uppercase tags for leniency
  const text = ofxText.replace(/\r\n/g, "\n");
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  const txns = blocks.map((blkRaw) => {
    const blk = "<STMTTRN>" + blkRaw; // re-add for regex context
    const pick = (tag: string) => {
      const m = blk.match(new RegExp(`<${tag}>([^<\n\r]+)`, "i"));
      return m ? m[1].trim() : undefined;
    };

    const dt = pick("DTPOSTED") || pick("DTUSER") || pick("DTAVAIL");
    // OFX dates like 20240131 or 20240131HHMMSS[.XXX][TZ]
    let dateStr = dt?.slice(0, 8) ?? "";
    const yyyy = dateStr.slice(0, 4);
    const mm = dateStr.slice(4, 6);
    const dd = dateStr.slice(6, 8);
    const isoDate = `${yyyy}-${mm}-${dd}`;

    const amountStr = pick("TRNAMT") || "0";
    const amount = Number(amountStr.replace(",", "."));

    const fitid = pick("FITID");
    const name = pick("NAME");
    const memo = pick("MEMO");
    const type = pick("TRNTYPE");

    const description = [name, memo].filter(Boolean).join(" - ") || undefined;

    return {
      date: isoDate,
      amount,
      fitid,
      memo,
      description,
      type,
      raw: blkRaw.substring(0, 5000), // keep limited raw context
    };
  }).filter(t => t.date && !Number.isNaN(t.amount));

  return txns;
}

// Extract account metadata from OFX header/statement sections
function parseAccountMeta(ofxText: string) {
  const pick = (tag: string) => {
    const m = ofxText.match(new RegExp(`<${tag}>([^<\n\r]+)`, 'i'));
    return m ? m[1].trim() : undefined;
  };
  const acctId = pick('ACCTID');
  const bankId = pick('BANKID');
  const branchId = pick('BRANCHID');
  const acctType = pick('ACCTTYPE');
  return { acctId, bankId, branchId, acctType };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => null) as { ofx?: string; fileName?: string } | null;
    if (!body?.ofx) {
      return new Response(JSON.stringify({ error: "Missing OFX content" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const ofxText = body.ofx;
    const fileName = body.fileName ?? "upload.ofx";

    // Resolve company from profile to avoid trusting client input
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile?.company_id) {
      return new Response(JSON.stringify({ error: "Profile or company not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const companyId = profile.company_id as string;

    // Create import record first
    const { data: importRow, error: importErr } = await supabase
      .from("transaction_imports")
      .insert({ user_id: userId, company_id: companyId, source: "ofx", file_name: fileName, status: "processing" })
      .select("id")
      .single();

    if (importErr) {
      console.error("import insert error", importErr);
      return new Response(JSON.stringify({ error: importErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const importId = importRow.id as string;
    const txns = parseOfx(ofxText);

    // Parse account metadata and upsert bank account
    const acctMeta = parseAccountMeta(ofxText);
    let accountUuid: string | null = null;
    if (acctMeta.acctId) {
      const display = [acctMeta.bankId, acctMeta.branchId, acctMeta.acctId].filter(Boolean).join(" - ");
      const { data: acc, error: accErr } = await supabase
        .from("bank_accounts")
        .upsert(
          {
            user_id: userId,
            company_id: companyId,
            account_id: acctMeta.acctId,
            bank_id: acctMeta.bankId,
            branch_id: acctMeta.branchId,
            acct_type: acctMeta.acctType,
            display_name: display || acctMeta.acctId,
          },
          { onConflict: "company_id,account_id,bank_id,branch_id" }
        )
        .select("id")
        .single();

      if (!accErr && acc?.id) {
        accountUuid = acc.id as string;
      }
    }

    // Load rules for categorization
    const { data: rules } = await supabase
      .from("transaction_rules")
      .select("pattern,category")
      .eq("company_id", companyId);

    const matchCategory = (text?: string) => {
      if (!text || !rules) return undefined;
      const target = text.toLowerCase();
      for (const r of rules as any[]) {
        const p = r?.pattern?.toLowerCase?.() || "";
        if (p && target.includes(p)) return r?.category;
      }
      return undefined;
    };

    // Prepare rows for upsert
    const rows = txns.map((t) => ({
      user_id: userId,
      company_id: companyId,
      import_id: importId,
      date: t.date,
      amount: t.amount,
      memo: t.memo,
      description: t.description,
      type: t.type,
      fitid: t.fitid,
      raw: t.raw,
      category: matchCategory(t.description || t.memo || t.raw),
      // account linking
      account_id: acctMeta.acctId,
      bank_id: acctMeta.bankId,
      branch_id: acctMeta.branchId,
      acct_type: acctMeta.acctType,
      bank_account_uuid: accountUuid,
    }));

    let imported = 0;
    if (rows.length > 0) {
      const { error: upsertErr, count } = await supabase
        .from("bank_transactions")
        .upsert(rows, { onConflict: "company_id,fitid", ignoreDuplicates: true, count: "exact" });

      if (upsertErr) {
        console.error("upsert error", upsertErr);
        return new Response(JSON.stringify({ error: upsertErr.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      imported = count ?? rows.length; // count of inserted/updated depending on constraint
    }

    // Update import counters and status
    await supabase
      .from("transaction_imports")
      .update({ total_transactions: rows.length, imported_transactions: imported, status: "completed" })
      .eq("id", importId);

    const result = { importId, total: rows.length, imported };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("ingest-ofx fatal", e);
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
