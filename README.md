# TURBINA · Concurso de Setups

Para los teams de Juno, Corgi y Bulldog. Funcionalmente igual al contest-app
original; estéticamente, nebulosa + turbina de vidrio neón + sonido PS2.

## Mecánica (idéntica al original)
- Fases gateadas por admin: **Draft → Submissions → Voting → Results**
- Participantes entran por link, ponen su nombre (sin cuentas)
- **Una entrada por persona**, compite en todas las categorías
- **Un voto por persona por categoría**
- Resultados ocultos hasta que la admin los libera

## Setup
1. Crear proyecto NUEVO en Supabase (no mezclar con contest-app).
2. SQL Editor → pegar y correr `schema.sql`.
3. Storage → crear bucket `entries` **público** → agregarle policies
   públicas de insert y select.
4. Copiar `.env.example` a `.env` y completar URL, anon key y password de admin.
5. `npm install` → `npm run dev`.
6. Deploy: repo en GitHub → importar en Vercel → cargar las 3 env vars.
   El `vercel.json` ya tiene el rewrite de SPA.

## Rutas
- `/` landing (turbina)
- `/join` nombre del participante
- `/submit` subir entrada
- `/vote` votación por categoría
- `/results` resultados (cuando se liberan)
- `/admin` panel (password en env)

## Notas de guerra heredadas
- Supabase free tier se pausa tras ~1 semana sin uso → botón Restore.
- Si un delete "no persiste", revisar RLS (ya incluida en schema.sql).
