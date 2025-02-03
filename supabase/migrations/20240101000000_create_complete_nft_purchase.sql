create or replace function complete_nft_purchase(
  p_listing_id bigint,
  p_buyer_id uuid,
  p_buyer_wallet text,
  p_transaction_signature text
) returns void as $$
begin
  -- Update the listing status to sold
  update marketplace_listings
  set 
    status = 'sold',
    updated_at = now(),
    transaction_signature = p_transaction_signature
  where id = p_listing_id;

  -- Get the art_id from the listing
  with listing_data as (
    select art_id
    from marketplace_listings
    where id = p_listing_id
  )
  -- Update the art ownership
  update art
  set 
    user_id = p_buyer_id,
    owner_wallet = p_buyer_wallet,
    updated_at = now()
  from listing_data
  where art.id = listing_data.art_id;

  -- Commit the transaction
  commit;
end;
$$ language plpgsql; 