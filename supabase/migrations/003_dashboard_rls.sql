-- Permette al creatore di un link di leggere la risposta e i propri
-- acquisti (serve alla dashboard /dashboard). Lettura solo per il
-- proprietario, tramite RLS — nessun'altra policy anon cambia.

create policy "answers select by link owner" on public.answers
  for select using (
    exists (
      select 1 from public.links
      where links.id = answers.link_id
        and links.creator_id = auth.uid()
    )
  );

create policy "purchases select own" on public.purchases
  for select using (auth.uid() = user_id);
