# ToDo

- Verificare che https funzi
- Usare redis per la gestione dei tokens
- Gestire l'utente admin e dargli i permessi di fare tutto. con GET '/admin' potrei avere lista di utenti registrati e gestire reset password, ban etc.
- Gestire cosa mando al client. Non sembra una buona idea mandare esattamente le colonne della mia tabella.
- Gestire la migration direttamente nel server. Quando avvii i container per la prima volta e non esiste un db.
- Handle chunk for big files like videos
- Add content-type to the uploaded file so that in the download I can add it.
- Optimize client key import, and store the CryptoKey in a map, to import it once. Needs to handle key expiration
- Deny the registration of some usernames like admin!
