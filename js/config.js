/* =====================================================================
   Conexión con Supabase (muévete.pe)
   Pega aquí la URL y la "anon public key" de tu proyecto:
   Supabase → Project Settings → API (o "Data API" / "API Keys").
   La anon key es pública por diseño: la seguridad la dan las reglas (RLS).
   Si se deja vacío, la web usa los datos de respaldo de la carpeta /data.
   ===================================================================== */
window.MUEVETE_DB = {
  url: "",          // ej: "https://abcdefghijk.supabase.co"
  anonKey: "",      // ej: "eyJhbGciOi..." o "sb_publishable_..."
  temporada: "Primavera 2026"
};
