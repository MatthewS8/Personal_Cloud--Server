# Key Generation Guide

## Overview

This guide provides detailed instructions on how to generate the necessary encryption keys required for the Personal_Cloud application. Ensure that all keys are generated and placed in the `/certificates` folder before the initial startup.

## Generating AES Key (ATSecret.pem)

1. Open your terminal.
2. Run the following command to generate a 256-bit AES key:

    ```sh
    openssl rand -base64 32 > /path/to/certificates/ATSecret.pem
    ```

3. Ensure the key is saved as `ATSecret.pem`.

## Generating RSA Public and Private Keys (public_key.pem and private_rsa_key.key)

1. Open your terminal.
2. Run the following command to generate a private RSA key:

    ```sh
    openssl genpkey -algorithm RSA -out /path/to/certificates/private_rsa_key.key
    ```

3. Extract the corresponding public key:

    ```sh
    openssl rsa -pubout -in /path/to/certificates/private_rsa_key.key -out /path/to/certificates/public_key.pem
    ```

4. Make sure to securely store both keys for your application.

## Generating AES Key (storage.pem)

1. Open your terminal.
2. Run the following command to generate a 256-bit AES key:

    ```sh
    openssl rand -base64 32 > /path/to/certificates/storage.pem
    ```

3. Ensure the key is saved as `storage.pem`.

## Conclusion

After generating all the necessary keys, place them in the `/certificates` folder to ensure the proper functioning of the Personal_Cloud application.
