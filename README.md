# Personal_Cloud

## About

Personal_Cloud is a robust server application designed to manage a secure cloud service for file storage. It ensures that all your files are encrypted, providing a high level of security and privacy. With Personal_Cloud, you can safely store, access, and manage your files from anywhere, knowing that your data is protected.

## Features

- Secure file storage
- File encryption
- User authentication

## Getting Started

To get started with Personal_Cloud, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/MatthewS8/Personal_Cloud--Server
    ```

2. Navigate to the project directory:

    ```sh
    cd Personal_Cloud
    ```

3. Create a `.env` file as the following example:

    ```env
    NODE_ENV=development
    REDIS_PASSWORD=redis_password
    DB_HOST=postgres
    DB_PORT=5432
    DB_USER=yourusername
    DB_PASSWORD=yourpassword
    DB_NAME=yourdbname
    ```

4. Build and run the Docker containers:

    ```sh
    docker-compose up --build
    ```

## ToDos

Check [ToDos](./TODO.md)

## Encryption Key Management

Before the initial startup, please ensure that all necessary encryption keys are available in the [`/certificates`](./server/certificates) folder. The keys __must__ be generated manually to ensure optimal security. The keys required are as follows:

- `ATSecret.pem` (AES): This key is used for authenticating tokens within the application.
- `public_key.pem` (RSA): This is the public key used for encrypting data sent to the server.
- `private_rsa_key.key` (RSA): This private RSA key is used for decrypting data received from clients.
- `storage.pem` (AES): This key is used to securely encrypt and store data within the server's storage system.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
