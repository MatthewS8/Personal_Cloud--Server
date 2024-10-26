# ToDo:
 - Verificare che https funzi
 - Usare redis per la gestione dei tokens
 - Gestire l'utente admin e dargli i permessi di fare tutto. con GET '/admin' potrei avere lista di utenti registrati e gestire reset password, ban etc. 
 - Gestire encrypt and session_key for encryption. Verificare perche dal client riesco a fare upload solo di file in chiaro
 - Gestire cosa mando al client. Non sembra una buona idea mandare esattamente le colonne della mia tabella.
 - Gestire la migration direttamente nel server. Quando avvii i container per la prima volta e non esiste un db,
  viene lanciato prima il comando di migrazione e poi il server e quindi il db non esiste. Trovata una soluzione temporanea e poco elegante 
  che pero' fallisce visto che la colonna esiste gia e non prosegue con i seed

